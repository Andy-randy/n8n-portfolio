# Supporting n8n Experiments

Small sanitized workflow exports used to explore integration patterns. These are supporting experiments, not featured case studies and not production-ready templates.

All exports are inactive, contain no credential mappings, and use public placeholders for account-specific values. Review every node and configure credentials before importing.

## Workflow index

| Export | Trigger | Purpose | Main integrations |
| --- | --- | --- | --- |
| [`ai-content-repurposing.json`](./ai-content-repurposing.json) | Webhook | Transform one source into channel-specific content and log the result | Groq, Telegram, Google Sheets |
| [`customer-support-routing.json`](./customer-support-routing.json) | Telegram | Classify a support message and route it by category | Groq, Telegram, Google Sheets |
| [`ecommerce-order-processing.json`](./ecommerce-order-processing.json) | Webhook | Route an order through validation, logging, notification, and API calls | Gmail, Telegram, Google Sheets, HTTP API |
| [`financial-monitoring.json`](./financial-monitoring.json) | Schedule | Evaluate scheduled financial records and notify on configured conditions | Google Sheets, Gmail, Telegram |
| [`hr-onboarding.json`](./hr-onboarding.json) | Google Sheets | Coordinate onboarding tasks across communication and work-management tools | Gmail, Telegram, Trello, GitHub, Google Sheets |

## Notion API experiments

| Export | Trigger | Purpose | Main integrations |
| --- | --- | --- | --- |
| [`add-notion-topic.json`](./notion/add-notion-topic.json) | Webhook | Add a topic through the Notion API | HTTP API |
| [`append-notion-buttons.json`](./notion/append-notion-buttons.json) | Manual | Append generated button blocks to a Notion page | Notion, HTTP API |
| [`explain-notion-topic.json`](./notion/explain-notion-topic.json) | Webhook | Generate and return an explanation for a Notion topic | HTTP API |
| [`populate-notion-knowledge-base.json`](./notion/populate-notion-knowledge-base.json) | Manual | Populate a configured knowledge-base structure | HTTP API |

## How to inspect safely

1. Open the JSON as text and review every `YOUR_*` placeholder.
2. Import into a non-production n8n workspace.
3. Attach credentials manually; never commit the resulting credential mappings.
4. Replace synthetic destinations and test with non-sensitive data.
5. Keep the workflow inactive until each branch has been exercised.

## Scope and limitations

These exports intentionally have lighter documentation and testing than the numbered case studies. They may rely on exact prompts, simple branching, Google Sheets, or external APIs without full idempotency, retry, observability, and retention controls.

Use them as implementation sketches. The numbered projects provide the portfolio's evidence for architecture, contracts, failure handling, examples, and test scenarios.

---

## Русская версия

Здесь собраны небольшие безопасно опубликованные эксперименты с n8n. Они показывают отдельные интеграционные паттерны, но не считаются полноценными case studies и не входят в featured-проекты профиля.

Перед импортом нужно проверить placeholders, вручную подключить credentials и протестировать workflow на несекретных данных. Production-гарантии — идемпотентность, retry, наблюдаемость и политика хранения — для этих файлов не заявляются.
