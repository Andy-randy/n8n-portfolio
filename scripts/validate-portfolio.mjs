import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const stats = { json: 0, workflows: 0, markdown: 0, images: 0, mermaid: 0 };
const canonicalProjectStubs = new Map([
  ['02-lead-funnel/README.md', 'https://github.com/Andy-randy/ai-lead-processing-pipeline'],
  ['04-rag-telegram-faq-bot/README.md', 'https://github.com/Andy-randy/rag-telegram-faq-bot'],
  ['08-barbershop-booking-api/README.md', 'https://github.com/Andy-randy/barbershop-booking-api'],
]);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(absolute));
    else if (entry.isFile()) result.push(absolute);
  }
  return result;
}

function relative(absolute) {
  return path.relative(root, absolute).split(path.sep).join('/');
}

function addError(file, message) {
  errors.push(`${file}: ${message}`);
}

function locatorValue(value) {
  return value && typeof value === 'object' ? value.value : value;
}

function validateWorkflow(document, file) {
  stats.workflows += 1;
  if (document.active !== false) addError(file, 'active must be false');
  for (const key of ['pinData', 'id', 'versionId', 'meta', 'staticData']) {
    if (Object.hasOwn(document, key)) addError(file, `top-level ${key} must be removed`);
  }

  const nodeNames = new Set(document.nodes.map((node) => node.name));
  const nodeIds = new Set();
  for (const node of document.nodes) {
    if (!node.name || typeof node.name !== 'string') addError(file, 'node without a valid name');
    if (nodeIds.has(node.id)) addError(file, `duplicate node id: ${node.id}`);
    nodeIds.add(node.id);
    if (node.credentials) addError(file, `${node.name}: credential mapping is present`);
    if (node.webhookId) addError(file, `${node.name}: webhookId is present`);

    const code = node.parameters?.jsCode;
    if (typeof code === 'string') {
      try { new AsyncFunction(code); }
      catch (error) { addError(file, `${node.name}: invalid Code node JavaScript: ${error.message}`); }
    }

    const chatId = node.parameters?.chatId;
    if (typeof chatId === 'string'
      && !chatId.includes('message.chat.id')
      && chatId !== 'YOUR_TELEGRAM_CHAT_ID') {
      addError(file, `${node.name}: chatId is not a public placeholder`);
    }

    const workflowId = node.parameters?.workflowId;
    const workflowValue = locatorValue(workflowId);
    if (workflowValue && !String(workflowValue).startsWith('YOUR_')) {
      addError(file, `${node.name}: workflowId is instance-specific`);
    }

    const documentValue = locatorValue(node.parameters?.documentId);
    if (documentValue && documentValue !== 'YOUR_GOOGLE_SHEET_ID') {
      addError(file, `${node.name}: documentId is not the public placeholder`);
    }

    const fileValue = locatorValue(node.parameters?.fileId);
    if (fileValue && fileValue !== 'YOUR_GOOGLE_DRIVE_FILE_ID') {
      addError(file, `${node.name}: fileId is not the public placeholder`);
    }

    const sheetName = node.parameters?.sheetName;
    const sheetValue = locatorValue(sheetName);
    if (typeof sheetValue === 'number' || /^gid=\d+$/i.test(String(sheetValue ?? ''))) {
      addError(file, `${node.name}: sheet identifier is instance-specific`);
    }
    if (node.parameters?.sheetName?.cachedResultUrl) {
      addError(file, `${node.name}: cached Google Sheets URL is present`);
    }

    const sendTo = node.parameters?.sendTo;
    if (typeof sendTo === 'string'
      && sendTo
      && !sendTo.includes('{{')
      && !sendTo.startsWith('YOUR_')) {
      addError(file, `${node.name}: static email recipient is not a public placeholder`);
    }

    const webhookPath = node.parameters?.path;
    if (typeof webhookPath === 'string'
      && /[0-9a-f]{8}-[0-9a-f-]{27,}/i.test(webhookPath)) {
      addError(file, `${node.name}: webhook path looks instance-specific`);
    }

    const headers = node.parameters?.headerParameters?.parameters;
    if (Array.isArray(headers)) {
      for (const header of headers) {
        if (String(header.name ?? '').toLowerCase() === 'authorization'
          && header.value !== 'Bearer YOUR_API_TOKEN') {
          addError(file, `${node.name}: Authorization header is not the public placeholder`);
        }
      }
    }
  }

  for (const [source, outputs] of Object.entries(document.connections)) {
    if (!nodeNames.has(source)) addError(file, `connection source does not exist: ${source}`);
    for (const channel of Object.values(outputs ?? {})) {
      if (!Array.isArray(channel)) continue;
      for (const branch of channel) {
        if (!Array.isArray(branch)) continue;
        for (const edge of branch) {
          if (edge?.node && !nodeNames.has(edge.node)) {
            addError(file, `connection target does not exist: ${edge.node}`);
          }
        }
      }
    }
  }

  const serialized = JSON.stringify(document);
  for (const forbidden of [
    'my_super_secret',
    'DEMO_SECRET_REPLACE_ME',
    'TELEGRAM_CHAT_ID_PLACEHOLDER',
    'REDACTED_EXTERNAL_URL',
    'REDACTED_WEBHOOK_PATH',
    'instanceId',
    'REDACTED_EMAIL',
    'REDACTED_NOTION_DATABASE_ID',
    'REDACTED_N8N_WEBHOOK_BASE_URL',
    'YOUR_API_KEY_HERE',
    'gid=0',
  ]) {
    if (serialized.includes(forbidden)) addError(file, `forbidden public value remains: ${forbidden}`);
  }

  const unsupportedRedaction = serialized.match(/REDACTED_(?!NODE_ID|INTERNAL_ID)[A-Z0-9_]+/);
  if (unsupportedRedaction) {
    addError(file, `non-standard placeholder remains: ${unsupportedRedaction[0]}`);
  }

  const nodeByName = (name) => document.nodes.find((node) => node.name === name);

  if (file.endsWith('01-ai-sales-assistant/workflows/ai-sales-assistant.json')) {
    for (const placeholder of ['YOUR_BUSINESS_ADDRESS', 'YOUR_BUSINESS_HOURS', 'YOUR_SERVICE_CATALOG']) {
      if (!serialized.includes(placeholder)) addError(file, `public business prompt is missing ${placeholder}`);
    }
  }

  if (file.endsWith('02-lead-funnel/workflows/ai-lead-processing-pipeline.json')) {
    const parserCode = nodeByName('Parse AI Classification')?.parameters?.jsCode ?? '';
    if (!parserCode.includes("['горячий', 'тёплый', 'холодный']")) {
      addError(file, 'lead-temperature allowlist is missing');
    }
    if (!parserCode.includes("temperature: 'ошибка'")) {
      addError(file, 'malformed AI fallback is missing');
    }
  }

  if (file.endsWith('03-hh-parser/workflows/smart-vacancy-parser.json')) {
    const parserCode = nodeByName('Parse AI Assessment')?.parameters?.jsCode ?? '';
    const route = JSON.stringify(nodeByName('If')?.parameters ?? {});
    if (!parserCode.includes('score < 0 || score > 100') || !parserCode.includes("ai_verdict: 'review'")) {
      addError(file, 'vacancy score validation or manual-review fallback is missing');
    }
    if (!route.includes('ai_score') || !route.includes('"rightValue":60')) {
      addError(file, 'vacancy route does not enforce the AI score threshold');
    }
  }

  if (file.endsWith('07-ai-service-request-automation/workflows/ai-service-request-main.json')) {
    const parserCode = nodeByName('Parse AI answer')?.parameters?.jsCode ?? '';
    if (!parserCode.includes('allowedUrgencies')
      || !parserCode.includes('confidence < 0 || confidence > 1')
      || !parserCode.includes('ai_error')) {
      addError(file, 'service-request AI contract validation is incomplete');
    }
  }

  if (file.endsWith('08-barbershop-booking-api/workflows/barbershop-booking-api.json')) {
    const duplicateLookup = JSON.stringify(nodeByName('проверка дублей')?.parameters ?? {});
    const append = JSON.stringify(nodeByName('создание записи')?.parameters ?? {});
    if (!duplicateLookup.includes("$('создание booking_key').item.json.booking_key")
      || !append.includes("$('создание booking_key').item.json.booking_key")) {
      addError(file, 'booking_key lookup and append must use the normalized key node');
    }
  }

  if (file.endsWith('08-barbershop-booking-api/workflows/barbershop-error-handler.json')) {
    if (serialized.includes('Input Data') || serialized.includes('$json.node.parameters')) {
      addError(file, 'error handler exposes full node input or parameters');
    }
  }
}

async function validateJson(absolute) {
  const file = relative(absolute);
  stats.json += 1;
  try {
    const document = JSON.parse(await readFile(absolute, 'utf8'));
    if (Array.isArray(document.nodes) && document.connections) validateWorkflow(document, file);
  } catch (error) {
    addError(file, `invalid JSON: ${error.message}`);
  }
}

function stripLinkTarget(target) {
  return target.trim().replace(/^<|>$/g, '').split('#')[0].split('?')[0];
}

function githubSlug(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

async function validateMarkdown(absolute) {
  const file = relative(absolute);
  const source = await readFile(absolute, 'utf8');
  const lineCount = source.split(/\r?\n/).length - (source.endsWith('\n') ? 1 : 0);
  stats.markdown += 1;

  const fences = source.match(/^```/gm)?.length ?? 0;
  if (fences % 2 !== 0) addError(file, 'unbalanced fenced code blocks');
  stats.mermaid += source.match(/^```mermaid\s*$/gm)?.length ?? 0;

  const russianMarker = source.search(/^## (?:Русская версия|По-русски|🇷🇺)/m);
  const firstSection = source.search(/^## /m);
  if (/^(?:0[1-8]-|README\.md$)/.test(file)
    && russianMarker !== -1
    && firstSection === russianMarker) {
    addError(file, 'README is not English-first');
  }

  if (file === 'README.md' && (lineCount < 120 || lineCount > 200)) {
    addError(file, `root README must contain 120–200 lines; found ${lineCount}`);
  }

  if (/^0[1-8]-[^/]+\/README\.md$/.test(file) && !canonicalProjectStubs.has(file)) {
    const requiredSections = [
      '## Business problem',
      '## Solution',
      '## Architecture',
      '## Workflow screenshots / Output evidence',
      '## Key engineering decisions',
      '## Input and output contract',
      '## Failure handling',
      '## Repository structure',
      '## Setup',
      '## Test scenarios',
      '## Known limitations',
      '## Production hardening path',
      '## Tech stack',
      '## Русская версия',
    ];
    let previous = -1;
    for (const heading of requiredSections) {
      const position = source.indexOf(`${heading}\n`);
      if (position === -1) addError(file, `missing required section: ${heading}`);
      else if (position <= previous) addError(file, `section is out of order: ${heading}`);
      previous = Math.max(previous, position);
    }
  }

  if (canonicalProjectStubs.has(file)) {
    const canonicalUrl = canonicalProjectStubs.get(file);
    if (!source.includes(canonicalUrl)) addError(file, `missing canonical repository link: ${canonicalUrl}`);
  }

  const headingAnchors = new Set(
    [...source.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => githubSlug(match[1])),
  );
  for (const match of source.matchAll(/\[[^\]]*\]\(#([^)]+)\)/g)) {
    if (!headingAnchors.has(match[1])) addError(file, `broken local anchor: #${match[1]}`);
  }

  const imageAlts = new Set();
  for (const match of source.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
    const alt = match[1].trim();
    if (!alt) addError(file, `image has empty alt text: ${match[2]}`);
    if (imageAlts.has(alt)) addError(file, `duplicate image alt text: ${alt}`);
    imageAlts.add(alt);
  }

  const linkPattern = /!?(?:\[[^\]]*\])\(([^)]+)\)/g;
  for (const match of source.matchAll(linkPattern)) {
    const target = stripLinkTarget(match[1]);
    if (!target || /^(?:https?:|mailto:|#)/i.test(target)) continue;
    let decoded;
    try { decoded = decodeURIComponent(target); } catch { decoded = target; }
    const resolved = path.resolve(path.dirname(absolute), decoded);
    try { await stat(resolved); } catch { addError(file, `broken relative link: ${target}`); }
  }
}

async function validateImage(absolute) {
  const file = relative(absolute);
  const info = await stat(absolute);
  const bytes = await readFile(absolute);
  stats.images += 1;
  if (info.size > 2 * 1024 * 1024) addError(file, 'image exceeds 2 MB');

  const extension = path.extname(file).toLowerCase();
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (extension === '.png' && !png) addError(file, 'file extension is PNG but media type is not');
  if (['.jpg', '.jpeg'].includes(extension) && !jpeg) addError(file, 'file extension is JPEG but media type is not');
}

const allowedSpecialPaths = new Set([
  'README.md',
  'docs/ARCHITECTURE.md',
  'tests/TEST_CASES.md',
]);

for (const file of canonicalProjectStubs.keys()) {
  const directory = path.dirname(path.join(root, file));
  const entries = await readdir(directory);
  if (entries.length !== 1 || entries[0] !== 'README.md') {
    addError(file, 'canonical project stub directory must contain only README.md');
  }
}

for (const absolute of await walk(root)) {
  const file = relative(absolute);
  const basename = path.basename(file);
  if (file.endsWith('.json')) await validateJson(absolute);
  if (file.endsWith('.md')) await validateMarkdown(absolute);
  if (/\.(?:png|jpe?g)$/i.test(file)) await validateImage(absolute);

  if (/[А-Яа-яЁё& ]/.test(file)
    && !allowedSpecialPaths.has(file)
    && !allowedSpecialPaths.has(file.slice(file.indexOf('/') + 1))
    && !['README.md', 'ARCHITECTURE.md', 'TEST_CASES.md'].includes(basename)) {
    addError(file, 'public path must use English kebab-case without spaces or ampersands');
  }
}

console.log(`JSON files: ${stats.json}`);
console.log(`Workflow exports: ${stats.workflows}`);
console.log(`Markdown files: ${stats.markdown}`);
console.log(`Images: ${stats.images}`);
console.log(`Mermaid blocks: ${stats.mermaid}`);

if (errors.length) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Portfolio validation passed.');
}
