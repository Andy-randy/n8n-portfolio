[README1.md](https://github.com/user-attachments/files/27012768/README1.md)
# n8n Portfolio · Daria

Портфолио воркфлоу на n8n с интеграцией LLM — AI-агенты для продаж, маршрутизация лидов, парсинг данных с LLM-скорингом. Каждый featured-кейс разобран по схеме **Контекст → Система → Что интересно → Стек**, с экспортированным JSON и скринами архитектуры.

An n8n workflow portfolio with LLM integrations — AI agents for sales, lead routing, data parsing with LLM-based scoring. Each featured case is documented as **Context → System → What's interesting → Stack**, with the exported JSON and architecture screenshots.

[🇷🇺 По-русски](#-по-русски) · [🇬🇧 In English](#-in-english)

---

## 🇷🇺 По-русски

### Featured-кейсы

| # | Кейс | Ключевая идея | Стек |
|---|------|---------------|------|
| 1 | [AI-ассистент, который сам закрывает заказы](./01-ai-sales-assistant/) | LLM решает, когда пора оформлять сделку | `n8n` · `Groq` · `Telegram` · `Google Sheets` |
| 2 | [Воронка лидов с LLM-классификатором](./02-lead-funnel/) | Groq-классификатор + Switch на 3 разных ответа: от холодного email до сделки в CRM | `n8n` · `Groq` · Webhook · `Gmail` · `Bitrix24` |
| 3 | [Умный парсер вакансий с LLM-скорингом](./03-hh-parser/) | Разделение LLM / детерминированной логики | `n8n` · `Groq` · `HH.ru API` · `Telegram` |

Каждый кейс — в своей папке, с подробным README на двух языках, экспортированным JSON и скринами.

### Остальные проекты

Менее формализованные, но рабочие — лежат в [`other-projects/`](./other-projects/) с экспортированными JSON:

- Новостной дайджест из RSS-источников
- Обработка заказов для e-commerce
- HR-онбординг с уведомлениями
- Финансовый мониторинг
- AI-репурпозинг контента
- Клиентский букинг-бот
- Автоматизации для Notion через API

### Стек

**Automation** `n8n` · webhooks · subworkflows · error handling · cron  
**AI / LLM** `Groq` · `OpenAI` · prompt engineering · AI-агенты с памятью  
**Backend** `Python` · REST API · `Docker` · `Git`  
**Data & tools** `Google Sheets` · `Notion API` · `Bitrix24` · `Telegram Bot API` · `HH.ru API`

### Как запустить воркфлоу

1. Скачай нужный `workflow.json` из папки кейса.
2. В n8n открой **Workflows → Import from File** и выбери JSON.
3. Настрой credentials: Telegram Bot, Groq API key, Google Sheets OAuth и так далее — список зависит от кейса, все нужные credentials указаны в README каждого проекта.
4. Активируй воркфлоу.

### Контакты

- Telegram: [@Andyyy_Randyyy](https://t.me/Andyyy_Randyyy)
- GitHub profile: [Andy-randy](https://github.com/Andy-randy)

---

## 🇬🇧 In English

### Featured case studies

| # | Case | Core idea | Stack |
|---|------|-----------|-------|
| 1 | [AI assistant that closes orders on its own](./01-ai-sales-assistant/) | The LLM decides when to close the deal | `n8n` · `Groq` · `Telegram` · `Google Sheets` |
| 2 | [Lead funnel with an LLM classifier](./02-lead-funnel/) | Groq classifier + Switch to 3 different actions: from cold email to a deal in CRM | `n8n` · `Groq` · Webhook · `Gmail` · `Bitrix24` |
| 3 | [Smart vacancy parser with LLM-based scoring](./03-hh-parser/) | A clean LLM / deterministic-logic split | `n8n` · `Groq` · `HH.ru API` · `Telegram` |

Each case lives in its own folder with a detailed bilingual README, the exported JSON, and screenshots.

### Other projects

Less formalised but working — in [`other-projects/`](./other-projects/) with exported JSON:

- RSS news digest
- E-commerce order processing
- HR onboarding with notifications
- Financial monitoring
- AI content repurposing
- Customer booking bot
- Notion API automations

### Stack

**Automation** `n8n` · webhooks · subworkflows · error handling · cron  
**AI / LLM** `Groq` · `OpenAI` · prompt engineering · AI agents with memory  
**Backend** `Python` · REST APIs · `Docker` · `Git`  
**Data & tools** `Google Sheets` · `Notion API` · `Bitrix24` · `Telegram Bot API` · `HH.ru API`

### How to run a workflow

1. Download the `workflow.json` from the case folder.
2. In n8n, go to **Workflows → Import from File** and select the JSON.
3. Configure credentials: Telegram Bot, Groq API key, Google Sheets OAuth, etc. — the exact list depends on the case and is listed in each project's README.
4. Activate the workflow.

### Contacts

- Telegram: [@Andyyy_Randyyy](https://t.me/Andyyy_Randyyy)
- GitHub profile: [Andy-randy](https://github.com/Andy-randy)
