import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const workflowNames = new Map([
  ['01-ai-sales-assistant/workflows/ai-sales-assistant.json', 'AI Sales Assistant'],
  ['02-lead-funnel/workflows/ai-lead-processing-pipeline.json', 'AI Lead Processing Pipeline'],
  ['03-hh-parser/workflows/smart-vacancy-parser.json', 'Smart Vacancy Parser'],
  ['04-rag-telegram-faq-bot/workflows/rag-ingest.json', 'RAG Knowledge Ingestion'],
  ['04-rag-telegram-faq-bot/workflows/rag-query.json', 'RAG Telegram Query'],
  ['05-competitor-price-monitoring/workflows/competitor-price-monitoring.json', 'Competitor Price Monitoring'],
  ['06-fitness-club-lead-capture/workflows/fitness-club-lead-capture.json', 'Fitness Club Lead Capture — Main'],
  ['06-fitness-club-lead-capture/workflows/validate-fitness-lead.json', 'Fitness Club Lead Capture — Validation'],
  ['07-ai-service-request-automation/workflows/ai-service-request-main.json', 'AI Service Request Automation — Main'],
  ['07-ai-service-request-automation/workflows/validate-service-request.json', 'AI Service Request Automation — Validation'],
  ['08-barbershop-booking-api/workflows/barbershop-booking-api.json', 'Barbershop Booking API'],
  ['08-barbershop-booking-api/workflows/barbershop-error-handler.json', 'Barbershop Booking Error Handler'],
  ['08-barbershop-booking-api/workflows/barbershop-notifications.json', 'Barbershop Booking Notifications'],
  ['08-barbershop-booking-api/workflows/barbershop-validation.json', 'Barbershop Booking Validation'],
  ['experiments/ai-content-repurposing.json', 'AI Content Repurposing'],
  ['experiments/ecommerce-order-processing.json', 'Ecommerce Order Processing'],
  ['experiments/hr-onboarding.json', 'HR Onboarding'],
  ['experiments/customer-support-routing.json', 'Customer Support Routing'],
  ['experiments/financial-monitoring.json', 'Financial Monitoring'],
  ['experiments/notion/explain-notion-topic.json', 'Explain a Notion Topic'],
  ['experiments/notion/append-notion-buttons.json', 'Append Notion Buttons'],
  ['experiments/notion/add-notion-topic.json', 'Add a Notion Topic'],
  ['experiments/notion/populate-notion-knowledge-base.json', 'Populate a Notion Knowledge Base'],
]);

const webhookPaths = new Map([
  ['02-lead-funnel/workflows/ai-lead-processing-pipeline.json', 'lead-processing'],
  ['06-fitness-club-lead-capture/workflows/fitness-club-lead-capture.json', 'fitness-club-lead'],
  ['07-ai-service-request-automation/workflows/ai-service-request-main.json', 'service-request'],
  ['08-barbershop-booking-api/workflows/barbershop-booking-api.json', 'barbershop-booking'],
  ['experiments/ai-content-repurposing.json', 'ai-content-repurposing'],
  ['experiments/ecommerce-order-processing.json', 'ecommerce-order'],
  ['experiments/notion/explain-notion-topic.json', 'notion-explain-topic'],
  ['experiments/notion/add-notion-topic.json', 'notion-add-topic'],
]);

function resourceLocator(current, value, mode = 'id') {
  if (current && typeof current === 'object' && !Array.isArray(current)) {
    const result = { ...current, __rl: true, value, mode };
    delete result.cachedResultUrl;
    delete result.cachedResultName;
    return result;
  }
  return value;
}

function workflowPlaceholder(relativePath, nodeName) {
  if (relativePath.startsWith('06-')) return 'YOUR_FITNESS_VALIDATION_WORKFLOW_ID';
  if (relativePath.startsWith('07-')) return 'YOUR_SERVICE_VALIDATION_WORKFLOW_ID';
  if (/notification/i.test(nodeName)) return 'YOUR_BARBERSHOP_NOTIFICATIONS_WORKFLOW_ID';
  return 'YOUR_BARBERSHOP_VALIDATION_WORKFLOW_ID';
}

function replaceKnownPlaceholders(value) {
  return value
    .replaceAll('my_super_secret', 'YOUR_API_SECRET')
    .replaceAll('DEMO_SECRET_REPLACE_ME', 'YOUR_API_SECRET')
    .replaceAll('YOUR_WEBHOOK_SECRET', 'YOUR_API_SECRET')
    .replaceAll('TELEGRAM_CHAT_ID_PLACEHOLDER', 'YOUR_TELEGRAM_CHAT_ID')
    .replaceAll('REDACTED_EXTERNAL_URL', 'YOUR_CRM_ENDPOINT')
    .replaceAll('REDACTED_WEBHOOK_PATH', 'lead-processing')
    .replaceAll('REDACTED_NOTION_DATABASE_ID', 'YOUR_NOTION_DATABASE_ID')
    .replaceAll('REDACTED_N8N_WEBHOOK_BASE_URL', 'YOUR_N8N_WEBHOOK_BASE_URL')
    .replaceAll('YOUR_API_KEY_HERE', 'YOUR_API_TOKEN')
    .replaceAll('REDACTED_EMAIL', 'YOUR_NOTIFICATION_EMAIL');
}

function sanitizeHeaders(parameters) {
  const headerItems = parameters?.headerParameters?.parameters;
  if (!Array.isArray(headerItems)) return;

  for (const header of headerItems) {
    const name = String(header.name ?? '').toLowerCase();
    if (name === 'authorization') header.value = 'Bearer YOUR_API_TOKEN';
    if (name === 'cookie') header.value = 'YOUR_HTTP_COOKIE';
    if (name === 'x-api-key' || name === 'api-key') header.value = 'YOUR_API_SECRET';
  }
}

function sanitizeNode(node, relativePath) {
  delete node.credentials;
  delete node.webhookId;

  const parameters = node.parameters ?? {};

  if ('documentId' in parameters) {
    parameters.documentId = resourceLocator(parameters.documentId, 'YOUR_GOOGLE_SHEET_ID');
  }
  if ('sheetName' in parameters
    && parameters.sheetName
    && typeof parameters.sheetName === 'object'
    && (typeof parameters.sheetName.value === 'number'
      || /^gid=\d+$/i.test(String(parameters.sheetName.value ?? ''))
      || String(parameters.sheetName.value ?? '').length > 20
      || parameters.sheetName.cachedResultUrl)) {
    parameters.sheetName = resourceLocator(
      parameters.sheetName,
      'YOUR_GOOGLE_SHEET_NAME',
      'name',
    );
  }
  if ('fileId' in parameters) {
    parameters.fileId = resourceLocator(parameters.fileId, 'YOUR_GOOGLE_DRIVE_FILE_ID');
  }
  if ('workflowId' in parameters) {
    parameters.workflowId = resourceLocator(
      parameters.workflowId,
      workflowPlaceholder(relativePath, node.name ?? ''),
    );
  }
  if ('chatId' in parameters) {
    const chatId = String(parameters.chatId ?? '');
    if (!chatId.includes('message.chat.id')) parameters.chatId = 'YOUR_TELEGRAM_CHAT_ID';
  }
  if ('path' in parameters && webhookPaths.has(relativePath)) {
    parameters.path = webhookPaths.get(relativePath);
  }

  if (typeof parameters.url === 'string') {
    const url = parameters.url;
    if (/REDACTED_EXTERNAL_URL|bitrix24|\/rest\//i.test(url)) {
      parameters.url = 'YOUR_CRM_ENDPOINT';
    }
    if (relativePath === 'experiments/notion/explain-notion-topic.json'
      && node.name === 'HTTP Request'
      && !url.startsWith('https://api.notion.com')) {
      parameters.url = 'YOUR_LLM_ENDPOINT';
    }
  }

  sanitizeHeaders(parameters);

  const visit = (value, key = '') => {
    if (typeof value === 'string') {
      let result = replaceKnownPlaceholders(value);
      if (relativePath.startsWith('experiments/notion/') && key !== 'id') {
        result = result
          .replace(/\b[0-9a-f]{32}\b/gi, 'YOUR_NOTION_PAGE_ID')
          .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, 'YOUR_NOTION_PAGE_ID');
      }
      return result;
    }
    if (Array.isArray(value)) return value.map((child) => visit(child, key));
    if (value && typeof value === 'object') {
      for (const [childKey, child] of Object.entries(value)) {
        value[childKey] = visit(child, childKey);
      }
    }
    return value;
  };

  visit(parameters);
}

async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(absolute));
    else if (entry.isFile() && entry.name.endsWith('.json')) result.push(absolute);
  }
  return result;
}

let changed = 0;
for (const absolute of await walk(root)) {
  const relativePath = path.relative(root, absolute).split(path.sep).join('/');
  const source = await readFile(absolute, 'utf8');
  const document = JSON.parse(source);
  if (!Array.isArray(document.nodes) || !document.connections) continue;

  document.active = false;
  delete document.pinData;
  delete document.id;
  delete document.versionId;
  delete document.meta;
  delete document.staticData;

  if (workflowNames.has(relativePath)) document.name = workflowNames.get(relativePath);
  for (const node of document.nodes) sanitizeNode(node, relativePath);

  const output = `${JSON.stringify(document, null, 2)}\n`;
  if (output !== source) {
    await writeFile(absolute, output, 'utf8');
    changed += 1;
  }
}

console.log(`Sanitized ${changed} workflow export(s).`);
