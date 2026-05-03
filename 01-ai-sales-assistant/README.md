# AI Lead Qualification & Sales Funnel Automation

## Description

This project is an n8n workflow for automated lead processing.

The workflow receives an incoming lead through a Webhook, analyzes it with an AI Agent, determines the lead temperature, and routes the lead through different scenarios for hot, warm, and cold customers.

The project demonstrates how to automate initial lead qualification, manager notifications, customer emails, Google Sheets logging, and CRM deal creation through a REST API.

---

## Business Problem

Sales managers often spend time manually reviewing incoming leads:

- who is ready to buy now;
- who needs a presentation or more details;
- who is just exploring;
- which lead should be handled first.

This workflow automatically classifies incoming leads and helps managers react faster to high-priority requests.

---

## What the Workflow Does

- receives a lead through Webhook;
- analyzes the request text with AI Agent;
- classifies the lead as:
  - hot;
  - warm;
  - cold;
- normalizes the AI JSON response with a Code node;
- extracts the budget from the request text;
- routes leads through Switch;
- sends a Telegram notification to the manager;
- sends an email to the customer;
- creates a CRM deal through Bitrix24 REST API;
- logs leads to Google Sheets;
- handles a fallback scenario if the AI returns invalid JSON.

---

## Tech Stack

- n8n
- Webhook
- AI Agent
- Groq Chat Model
- JavaScript Code node
- Switch
- Telegram
- Gmail
- Google Sheets
- Bitrix24 REST API

---

## Architecture

```text
Webhook
→ AI Agent
→ Code node
→ Switch
├── Cold lead → Email → Google Sheets
├── Hot lead → Telegram manager notification → Bitrix24 CRM
├── Warm lead → Email presentation → Google Sheets
└── Fallback → Telegram error notification
```

---

## Example Input

```json
{
  "name": "Anton",
  "email": "anton@example.com",
  "phone": "+79990000000",
  "request": "I want to automate website leads, budget 50000, need it in 2 weeks"
}
```

---

## Example AI Response

```json
{
  "temperature": "hot",
  "reason": "The customer specified a clear task, budget, and deadline.",
  "next_action": "Send the lead to the manager immediately"
}
```

> In the actual workflow, lead categories are returned in Russian: `горячий`, `тёплый`, `холодный`.

---

## Classification Logic

### Hot Lead

The customer is ready to buy: they provided a specific task, budget, deadline, or clearly stated purchase intent.

Actions:

- notify the manager in Telegram;
- create a deal in Bitrix24 CRM;
- pass the deal amount to the `OPPORTUNITY` field.

### Warm Lead

The customer is interested but still needs more information.

Actions:

- send a presentation or service description;
- save the lead to Google Sheets.

### Cold Lead

The customer is only exploring and has no clear buying intent yet.

Actions:

- send useful educational material;
- save the lead to Google Sheets.

### Fallback

If the AI returns invalid JSON, the workflow sends a Telegram notification for manual review.

---

## Code Node

The Code node performs several tasks:

- removes markdown formatting from the AI response;
- parses JSON;
- preserves the original lead data;
- extracts the budget from the request text;
- passes a normalized object to the next nodes.

Example output after the Code node:

```json
{
  "name": "Anton",
  "email": "anton@example.com",
  "phone": "+79990000000",
  "request": "I want to automate website leads, budget 50000, need it in 2 weeks",
  "budget": 50000,
  "temperature": "горячий",
  "reason": "The customer specified a clear task, budget, and deadline.",
  "next_action": "Send the lead to the manager immediately"
}
```

---

## CRM Integration

CRM integration is implemented through Bitrix24 REST API using the `crm.deal.add` method.

The workflow sends the following fields:

- `TITLE` — deal title;
- `COMMENTS` — customer and request details;
- `OPPORTUNITY` — deal amount;
- `CURRENCY_ID` — deal currency.

Example request body:

```json
{
  "fields": {
    "TITLE": "Lead from Anton",
    "COMMENTS": "Phone: +79990000000 Email: anton@example.com Request: I want to automate website leads",
    "OPPORTUNITY": 50000,
    "CURRENCY_ID": "RUB"
  }
}
```

---

## Security

The public workflow version does not include:

- real emails;
- Telegram chat_id;
- Bitrix24 webhook URL;
- API keys;
- credentials;
- personal data.

To run the workflow, you need to add your own credentials in n8n.

---

## How to Run

1. Import the workflow JSON into n8n.
2. Connect credentials:
   - Groq;
   - Telegram;
   - Gmail;
   - Google Sheets;
   - Bitrix24 webhook.
3. Set up your Google Sheets documents.
4. Replace demo values:
   - `YOUR_TELEGRAM_CHAT_ID`;
   - `client@example.com`;
   - `https://your-domain.bitrix24.ru/rest/USER_ID/WEBHOOK_KEY/crm.deal.add.json`.
5. Send a test request through browser, Postman, or the n8n test webhook URL.
6. Test routing for:
   - hot lead;
   - warm lead;
   - cold lead;
   - fallback.
7. Activate the workflow.

---

## Possible Improvements

- log hot leads to Google Sheets after CRM deal creation;
- add Error Workflow;
- add retry logic for CRM errors;
- add lead score from 0 to 100;
- add UTM tracking;
- create a separate CRM task for the manager;
- add a lead analytics dashboard;
- replace Bitrix24 with amoCRM, HubSpot, or Pipedrive;
- store all events in Supabase.

---

## Project Status

Educational portfolio project.

The main workflow logic has been built and tested:

- Webhook receives leads;
- AI Agent classifies leads;
- Code node normalizes data;
- Switch routes requests;
- Telegram/Gmail/Google Sheets/CRM are used for different processing scenarios.

CRM integration is implemented through REST API. Real keys and credentials were removed before publishing.

---

# Русская версия

## Описание

Этот проект — workflow на n8n для автоматической обработки входящих заявок.

Workflow принимает заявку через Webhook, анализирует её с помощью AI Agent, определяет “температуру” лида и запускает разные сценарии обработки для горячих, тёплых и холодных клиентов.

Проект показывает, как можно автоматизировать первичную квалификацию заявок, уведомления менеджера, отправку писем клиентам, запись данных в Google Sheets и создание сделки в CRM через REST API.

---

## Бизнес-задача

Менеджеры часто тратят время на ручной разбор входящих заявок:

- кто готов купить прямо сейчас;
- кому нужно отправить презентацию;
- кто просто интересуется;
- какую заявку нужно обработать в первую очередь.

Этот workflow автоматически классифицирует заявки и помогает быстрее реагировать на приоритетных клиентов.

---

## Что умеет workflow

- принимает заявку через Webhook;
- анализирует текст заявки через AI Agent;
- определяет температуру лида:
  - горячий;
  - тёплый;
  - холодный;
- нормализует JSON-ответ AI через Code-ноду;
- извлекает бюджет из текста заявки;
- маршрутизирует лиды через Switch;
- отправляет уведомление менеджеру в Telegram;
- отправляет email клиенту;
- создаёт сделку в CRM через Bitrix24 REST API;
- записывает заявки в Google Sheets;
- обрабатывает fallback-сценарий, если AI вернул некорректный ответ.

---

## Стек

- n8n
- Webhook
- AI Agent
- Groq Chat Model
- JavaScript Code node
- Switch
- Telegram
- Gmail
- Google Sheets
- Bitrix24 REST API

---

## Архитектура

```text
Webhook
→ AI Agent
→ Code node
→ Switch
├── Cold lead → Email → Google Sheets
├── Hot lead → Telegram manager notification → Bitrix24 CRM
├── Warm lead → Email presentation → Google Sheets
└── Fallback → Telegram error notification
```

---

## Пример входящих данных

```json
{
  "name": "Антон",
  "email": "anton@example.com",
  "phone": "+79990000000",
  "request": "Хочу автоматизировать заявки с сайта, бюджет 50000, нужно за 2 недели"
}
```

---

## Пример AI-ответа

```json
{
  "temperature": "горячий",
  "reason": "Клиент указал конкретную задачу, бюджет и срок.",
  "next_action": "Срочно передать менеджеру"
}
```

---

## Логика классификации

### Горячий лид

Клиент готов к покупке: указал конкретную задачу, бюджет, сроки или явно хочет заказать услугу.

Действия:

- уведомить менеджера в Telegram;
- создать сделку в Bitrix24 CRM;
- передать сумму сделки в поле `OPPORTUNITY`.

### Тёплый лид

Клиент заинтересован, но пока уточняет детали.

Действия:

- отправить презентацию или описание услуги;
- сохранить заявку в Google Sheets.

### Холодный лид

Клиент просто интересуется без явного намерения купить.

Действия:

- отправить полезный материал;
- сохранить заявку в Google Sheets.

### Fallback

Если AI вернул некорректный JSON, workflow отправляет уведомление в Telegram для ручной проверки.

---

## Code node

Code-нода выполняет несколько задач:

- очищает AI-ответ от markdown;
- парсит JSON;
- сохраняет исходные данные заявки;
- извлекает бюджет из текста заявки;
- передаёт дальше нормализованный объект.

Пример результата после Code-ноды:

```json
{
  "name": "Антон",
  "email": "anton@example.com",
  "phone": "+79990000000",
  "request": "Хочу автоматизировать заявки с сайта, бюджет 50000, нужно за 2 недели",
  "budget": 50000,
  "temperature": "горячий",
  "reason": "Клиент указал бюджет, срок и конкретную задачу.",
  "next_action": "Срочно передать менеджеру"
}
```

---

## CRM-интеграция

CRM-интеграция реализована через Bitrix24 REST API методом `crm.deal.add`.

Передаются поля:

- `TITLE` — название сделки;
- `COMMENTS` — данные клиента и заявки;
- `OPPORTUNITY` — сумма сделки;
- `CURRENCY_ID` — валюта сделки.

Пример тела запроса:

```json
{
  "fields": {
    "TITLE": "Заявка от Антон",
    "COMMENTS": "Телефон: +79990000000 Email: anton@example.com Заявка: Хочу автоматизировать заявки с сайта",
    "OPPORTUNITY": 50000,
    "CURRENCY_ID": "RUB"
  }
}
```

---

## Безопасность

Из публичной версии workflow удалены:

- реальные email;
- Telegram chat_id;
- Bitrix24 webhook URL;
- API keys;
- credentials;
- персональные данные.

Для запуска нужно добавить собственные credentials в n8n.

---

## Как запустить

1. Импортировать workflow JSON в n8n.
2. Подключить credentials:
   - Groq;
   - Telegram;
   - Gmail;
   - Google Sheets;
   - Bitrix24 webhook.
3. Указать свои Google Sheets документы.
4. Заменить demo-значения:
   - `YOUR_TELEGRAM_CHAT_ID`;
   - `client@example.com`;
   - `https://your-domain.bitrix24.ru/rest/USER_ID/WEBHOOK_KEY/crm.deal.add.json`.
5. Выполнить тестовый запрос через браузер, Postman или webhook test URL.
6. Проверить маршрутизацию по категориям:
   - горячий;
   - тёплый;
   - холодный;
   - fallback.
7. Активировать workflow.

---

## Возможные улучшения

- добавить запись горячих лидов в Google Sheets после создания сделки в CRM;
- добавить Error Workflow;
- добавить retry при ошибке CRM;
- добавить lead score от 0 до 100;
- добавить UTM-метки;
- добавить отдельную задачу менеджеру в CRM;
- добавить dashboard по лидам;
- заменить Bitrix24 на amoCRM, HubSpot или Pipedrive;
- сохранять все события в Supabase.

---

## Статус проекта

Учебно-портфолио проект.

Основная логика workflow собрана и протестирована:

- Webhook принимает заявки;
- AI Agent классифицирует лиды;
- Code node нормализует данные;
- Switch маршрутизирует заявки;
- Telegram/Gmail/Google Sheets/CRM используются для обработки разных сценариев.

CRM-интеграция реализована через REST API. Реальные ключи и credentials удалены перед публикацией.
