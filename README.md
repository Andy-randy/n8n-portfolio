# n8n Portfolio · Daria Lesnikova

Портфолио workflow-проектов на **n8n** с интеграцией **LLM, API, Telegram, Google Sheets, Gmail, Bitrix24 и Notion**.

Здесь собраны автоматизации, которые решают практические бизнес-задачи: обработка заявок, квалификация лидов, клиентская коммуникация, парсинг данных, мониторинг цен, уведомления и логирование.

An n8n workflow portfolio with **LLM, API, Telegram, Google Sheets, Gmail, Bitrix24, and Notion** integrations.

The repository contains practical automation projects for lead processing, AI qualification, customer communication, data parsing, price monitoring, notifications, and logging.

[🇷🇺 По-русски](#-по-русски) · [🇬🇧 In English](#-in-english)

---

## 🇷🇺 По-русски

## Структура репозитория

```text
n8n-portfolio/
├── 01-ai-sales-assistant/
├── 02-lead-funnel/
├── 03-hh-parser/
├── 04-rag-telegram-faq-bot/
├── 05-competitor-price-&-offer-monitoring-system/
├── other-projects/
└── README.md
```

---

## Featured-кейсы

| # | Проект | Что делает | Стек |
|---|--------|------------|------|
| 1 | [AI-ассистент продаж](./01-ai-sales-assistant/) | Ведёт клиента в Telegram, собирает данные и помогает оформить заказ | `n8n` · `Groq` · `Telegram` · `Google Sheets` |
| 2 | [ИИ-воронка квалификации лидов](./02-lead-funnel/) | Валидирует заявки, классифицирует лидов через ИИ, извлекает бюджет и маршрутизирует обработку | `n8n` · `Groq` · `Webhook` · `Gmail` · `Telegram` · `Google Sheets` · `Bitrix24` |
| 3 | [Умный парсер вакансий](./03-hh-parser/) | Получает вакансии через API, фильтрует и оценивает их через LLM | `n8n` · `Groq` · `HH.ru API` · `Telegram` |
| 4 | [RAG Telegram FAQ Bot](./04-rag-telegram-faq-bot/) | Отвечает на вопросы в Telegram по базе знаний из PDF через Supabase Vector Store | `n8n` · `RAG` · `Supabase` · `Groq` · `Telegram` |
| 5 | [Мониторинг цен конкурентов](./05-competitor-price-&-offer-monitoring-system/) | Собирает цены с сайтов конкурентов, сравнивает с историей и отправляет Telegram-отчёты | `n8n` · `JavaScript` · `Google Sheets` · `Telegram` · `Groq` |

---

## 1. AI-ассистент продаж

**Папка:** [`01-ai-sales-assistant`](./01-ai-sales-assistant/)

AI-ассистент для Telegram, который ведёт клиента по сценарию продажи: отвечает на вопросы, собирает нужные данные и определяет, когда можно оформлять заказ.

### Ключевая логика

```text
Telegram Trigger
→ AI Agent + Simple Memory
→ IF
├── уточняющий вопрос клиенту
└── подтверждение заказа → Google Sheets → Telegram manager notification
```

### Что показывает проект

- работу AI Agent в n8n;
- использование Simple Memory;
- диалоговую логику без жёсткого if-else по ключевым словам;
- запись структурированных данных в Google Sheets;
- уведомление менеджера.

---

## 2. ИИ-воронка квалификации лидов

**Папка:** [`02-lead-funnel`](./02-lead-funnel/)

Production-oriented workflow для автоматической обработки входящих заявок. Система принимает лид через Webhook, валидирует поля, проверяет demo secret, классифицирует заявку через ИИ, извлекает бюджет из естественного текста и маршрутизирует обработку по температуре лида.

### Ключевая логика

```text
Webhook
→ Validate Lead Input
→ AI Classification
→ Parse & Normalize AI Output
→ Route by Temperature
├── холодный лид → email → Google Sheets → Response 200
├── тёплый лид → email → Google Sheets → Response 200
├── горячий лид → Telegram → Budget check → Bitrix24 CRM → Response 200
├── AI fallback → admin Telegram alert → Response 500
└── invalid input → Response 400
```

### Что показывает проект

- валидацию входящих данных до запуска ИИ;
- deterministic AI classification с `temperature: 0`;
- строгий parsing и проверку JSON-ответа модели;
- нормализацию ИИ-ответа (`теплый` → `тёплый`);
- извлечение бюджета из текста: `50к`, `50 тыс`, `1.5 млн`;
- маршрутизацию лидов через Switch;
- отдельные CRM-сценарии для заявок с бюджетом и без бюджета;
- интеграцию с Bitrix24 через REST API;
- fallback-ветку на случай некорректного ИИ-ответа;
- явные Webhook responses для успешных, невалидных и fallback-сценариев.

---

## 3. Умный парсер вакансий с LLM-скорингом

**Папка:** [`03-hh-parser`](./03-hh-parser/)

Workflow для поиска и первичной оценки вакансий. Он получает вакансии через HH.ru API, нормализует данные, оценивает вакансии через AI и отправляет результат в Telegram.

### Ключевая логика

```text
Manual / Schedule Trigger
→ HH.ru API
→ Code node
→ Loop Over Items
→ AI Agent
→ IF
→ Aggregate
→ Telegram digest
```

### Что показывает проект

- работу с внешним API;
- обработку массива данных;
- разделение AI-оценки и детерминированной фильтрации;
- сборку дайджеста через Aggregate + Code;
- Telegram-уведомления.

---

## 4. RAG Telegram FAQ Bot

**Папка:** [`04-rag-telegram-faq-bot`](./04-rag-telegram-faq-bot/)

Telegram FAQ-бот на базе RAG: отдельный workflow загружает PDF-документы в Supabase Vector Store, а второй workflow принимает вопросы пользователей, ищет релевантные фрагменты и отвечает через Groq.

### Ключевая логика

```text
Google Drive PDF
→ Extract From File
→ Embeddings
→ Supabase Vector Store

Telegram Trigger
→ AI Agent
→ Supabase Vector Store Tool
→ Groq Chat Model
→ Telegram Response
→ Google Sheets Logging
```

### Что показывает проект

- RAG-архитектуру в n8n;
- раздельные ingest/query workflow;
- работу с Supabase Vector Store и embeddings;
- Telegram-бота с `/start` onboarding;
- логирование вопросов и ответов в Google Sheets.

---

## 5. Мониторинг цен и предложений конкурентов

**Папка:** [`05-competitor-price-&-offer-monitoring-system`](./05-competitor-price-&-offer-monitoring-system/)

Workflow для ежедневного мониторинга цен конкурентов. Система собирает товары с нескольких e-commerce сайтов, нормализует цены, сравнивает их с историей в Google Sheets и отправляет отчёты и алерты в Telegram.

### Ключевая логика

```text
Schedule Trigger
→ Competitors list
→ HTTP Request
→ HTML / custom enrichment
→ Prepare products
├── daily Telegram report
└── Google Sheets history → price comparison → AI analysis → Telegram alert
```

### Что показывает проект

- парсинг нескольких сайтов с разными CSS-селекторами;
- обработку сайта, где цены подгружаются отдельным JSON-запросом;
- нормализацию названий и цен;
- сравнение с историей в Google Sheets;
- Telegram-отчёты и алерты;
- AI-анализ изменения цены.

---

## Остальные проекты

В папке [`other-projects`](./other-projects/) лежат менее формализованные, но рабочие workflow:

- RSS / news digest automation;
- e-commerce order processing;
- HR onboarding workflow;
- financial monitoring;
- AI content repurposing;
- customer support routing;
- Notion API automations.

---

## Стек

**Automation:** `n8n` · Webhook · Schedule Trigger · Telegram Trigger · IF · Switch · Loop · Aggregate  
**AI / LLM:** `Groq` · AI Agent · Simple Memory · RAG · Hugging Face Embeddings · structured JSON output · prompt engineering  
**Integrations:** `Telegram Bot API` · `Gmail` · `Google Sheets` · `Bitrix24 REST API` · `Notion API` · `HH.ru API` · `Supabase` · `pgvector`  
**Code:** `JavaScript` Code node · JSON parsing · data normalization  
**Tools:** `Git` · `GitHub` · `Docker` · `VS Code`

---

## Как запустить workflow

1. Открой нужную папку проекта.
2. Скачай файл `workflow.json`.
3. В n8n выбери **Workflows → Import from File**.
4. Подключи свои credentials:
   - Groq API;
   - Hugging Face API;
   - Telegram Bot;
   - Gmail;
   - Google Sheets;
   - Supabase;
   - Bitrix24 webhook или другой CRM API, если проект этого требует.
5. Замени demo-значения:
   - email;
   - Telegram chat_id;
   - webhook URL;
   - Google Sheets document ID;
   - CRM endpoint.
6. Запусти workflow в тестовом режиме.
7. После проверки активируй workflow.

---

## Безопасность

В публичных версиях workflow должны быть удалены:

- реальные API keys;
- webhook tokens;
- Telegram chat_id;
- личные email;
- реальные CRM endpoints;
- credentials blocks;
- персональные данные.

---

## Контакты

- Telegram: [@Andyyy_Randyyy](https://t.me/Andyyy_Randyyy)
- GitHub: [Andy-randy](https://github.com/Andy-randy)

---

## 🇬🇧 In English

## Repository Structure

```text
n8n-portfolio/
├── 01-ai-sales-assistant/
├── 02-lead-funnel/
├── 03-hh-parser/
├── 04-rag-telegram-faq-bot/
├── 05-competitor-price-&-offer-monitoring-system/
├── other-projects/
└── README.md
```

---

## Featured Case Studies

| # | Project | What it does | Stack |
|---|---------|--------------|-------|
| 1 | [AI Sales Assistant](./01-ai-sales-assistant/) | Talks to customers in Telegram, collects details, and helps confirm orders | `n8n` · `Groq` · `Telegram` · `Google Sheets` |
| 2 | [AI Lead Qualification Funnel](./02-lead-funnel/) | Validates leads, classifies them with AI, extracts budget, and routes each scenario | `n8n` · `Groq` · `Webhook` · `Gmail` · `Telegram` · `Google Sheets` · `Bitrix24` |
| 3 | [Smart Vacancy Parser](./03-hh-parser/) | Gets vacancies through API, filters them, and scores them with an LLM | `n8n` · `Groq` · `HH.ru API` · `Telegram` |
| 4 | [RAG Telegram FAQ Bot](./04-rag-telegram-faq-bot/) | Answers Telegram questions from a PDF knowledge base using Supabase Vector Store | `n8n` · `RAG` · `Supabase` · `Groq` · `Telegram` |
| 5 | [Competitor Price Monitoring](./05-competitor-price-&-offer-monitoring-system/) | Collects competitor prices, compares them with history, and sends Telegram reports | `n8n` · `JavaScript` · `Google Sheets` · `Telegram` · `Groq` |

---

## 1. AI Sales Assistant

**Folder:** [`01-ai-sales-assistant`](./01-ai-sales-assistant/)

A Telegram AI assistant that guides a customer through the sales flow: answers questions, collects required data, and decides when the order can be confirmed.

### Core Logic

```text
Telegram Trigger
→ AI Agent + Simple Memory
→ IF
├── follow-up question to customer
└── order confirmation → Google Sheets → Telegram manager notification
```

### What this project demonstrates

- AI Agent usage in n8n;
- Simple Memory;
- dialog logic without hard-coded keyword rules;
- structured data logging in Google Sheets;
- manager notification.

---

## 2. AI Lead Qualification Funnel

**Folder:** [`02-lead-funnel`](./02-lead-funnel/)

A production-oriented workflow for automatic incoming lead processing. The system receives a lead through Webhook, validates the input, checks a demo secret, classifies the request with an AI Agent, extracts budget from natural language, and routes the lead by temperature.

### Core Logic

```text
Webhook
→ Validate Lead Input
→ AI Classification
→ Parse & Normalize AI Output
→ Route by Temperature
├── cold lead → email → Google Sheets → Response 200
├── warm lead → email → Google Sheets → Response 200
├── hot lead → Telegram → Budget check → Bitrix24 CRM → Response 200
├── AI fallback → admin Telegram alert → Response 500
└── invalid input → Response 400
```

### What this project demonstrates

- input validation before AI execution;
- deterministic AI classification with `temperature: 0`;
- strict parsing and validation of AI JSON output;
- AI output normalization (`теплый` → `тёплый`);
- budget extraction from natural language: `50к`, `50 тыс`, `1.5 млн`;
- lead routing with Switch;
- separate CRM paths for leads with and without budget;
- Bitrix24 REST API integration;
- fallback handling for invalid AI output;
- explicit Webhook responses for success, invalid input, and fallback scenarios.

---

## 3. Smart Vacancy Parser With LLM Scoring

**Folder:** [`03-hh-parser`](./03-hh-parser/)

A workflow for job search and initial vacancy scoring. It gets vacancies through the HH.ru API, normalizes the data, evaluates each vacancy with AI, and sends the result to Telegram.

### Core Logic

```text
Manual / Schedule Trigger
→ HH.ru API
→ Code node
→ Loop Over Items
→ AI Agent
→ IF
→ Aggregate
→ Telegram digest
```

### What this project demonstrates

- external API usage;
- array processing;
- separation between AI evaluation and deterministic filtering;
- digest generation with Aggregate + Code;
- Telegram notifications.

---

## 4. RAG Telegram FAQ Bot

**Folder:** [`04-rag-telegram-faq-bot`](./04-rag-telegram-faq-bot/)

A Telegram FAQ bot built with RAG: one workflow ingests PDF documents into Supabase Vector Store, and another receives user questions, retrieves relevant chunks, and answers through Groq.

### Core Logic

```text
Google Drive PDF
→ Extract From File
→ Embeddings
→ Supabase Vector Store

Telegram Trigger
→ AI Agent
→ Supabase Vector Store Tool
→ Groq Chat Model
→ Telegram Response
→ Google Sheets Logging
```

### What this project demonstrates

- RAG architecture in n8n;
- separate ingest/query workflows;
- Supabase Vector Store and embeddings;
- Telegram bot onboarding with `/start`;
- question and answer logging in Google Sheets.

---

## 5. Competitor Price & Offer Monitoring

**Folder:** [`05-competitor-price-&-offer-monitoring-system`](./05-competitor-price-&-offer-monitoring-system/)

A workflow for daily competitor price monitoring. It collects products from multiple e-commerce websites, normalizes prices, compares them with Google Sheets history, and sends reports and alerts to Telegram.

### Core Logic

```text
Schedule Trigger
→ Competitors list
→ HTTP Request
→ HTML / custom enrichment
→ Prepare products
├── daily Telegram report
└── Google Sheets history → price comparison → AI analysis → Telegram alert
```

### What this project demonstrates

- parsing multiple websites with different CSS selectors;
- handling a website where prices are loaded through a separate JSON request;
- product name and price normalization;
- historical comparison in Google Sheets;
- Telegram reports and alerts;
- AI analysis of price changes.

---

## Other Projects

The [`other-projects`](./other-projects/) folder contains less formalized but working workflows:

- RSS / news digest automation;
- e-commerce order processing;
- HR onboarding workflow;
- financial monitoring;
- AI content repurposing;
- customer support routing;
- Notion API automations.

---

## Stack

**Automation:** `n8n` · Webhook · Schedule Trigger · Telegram Trigger · IF · Switch · Loop · Aggregate  
**AI / LLM:** `Groq` · AI Agent · Simple Memory · RAG · Hugging Face Embeddings · structured JSON output · prompt engineering  
**Integrations:** `Telegram Bot API` · `Gmail` · `Google Sheets` · `Bitrix24 REST API` · `Notion API` · `HH.ru API` · `Supabase` · `pgvector`  
**Code:** `JavaScript` Code node · JSON parsing · data normalization  
**Tools:** `Git` · `GitHub` · `Docker` · `VS Code`

---

## How to Run a Workflow

1. Open the project folder.
2. Download `workflow.json`.
3. In n8n, go to **Workflows → Import from File**.
4. Connect your own credentials:
   - Groq API;
   - Hugging Face API;
   - Telegram Bot;
   - Gmail;
   - Google Sheets;
   - Supabase;
   - Bitrix24 webhook or another CRM API if required by the project.
5. Replace demo values:
   - email;
   - Telegram chat_id;
   - webhook URL;
   - Google Sheets document ID;
   - CRM endpoint.
6. Run the workflow in test mode.
7. Activate it after testing.

---

## Security

Public workflow versions should not contain:

- real API keys;
- webhook tokens;
- Telegram chat_id;
- personal emails;
- real CRM endpoints;
- credentials blocks;
- personal data.

---

## Contacts

- Telegram: [@Andyyy_Randyyy](https://t.me/Andyyy_Randyyy)
- GitHub: [Andy-randy](https://github.com/Andy-randy)
