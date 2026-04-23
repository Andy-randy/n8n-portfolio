# 🎯 Воронка лидов с LLM-классификатором

[🇷🇺 По-русски](#-по-русски) · [🇬🇧 In English](#-in-english)

![Architecture](./screenshots/architecture.png)

---

## 🇷🇺 По-русски

### Контекст

Входящие лиды надо делить по температуре и распределять по каналам: холодных — в автоматическую рассылку с логом для аналитики, тёплых — в тихий email без нагрузки на менеджера, горячих — сразу в CRM со сделкой и пингом менеджеру. Ручной разбор заявок превращается в узкое место: к моменту, когда менеджер открыл заявку, горячий клиент уже ушёл к конкурентам.

### Система

```
Webhook
   ↓
AI Agent (Groq) — классификатор
   ↓
  Switch (холодный / тёплый / горячий)
  ↙        ↓         ↘
холодный  тёплый    горячий
   ↓        ↓          ↓
Gmail    Gmail     Telegram (менеджеру)
  +                    +
Sheets               HTTP Request → Bitrix24
                     (создание сделки)
```

1. **Webhook** — универсальная точка входа. Форма на лендинге, чат-бот, любой сервис умеют отправить POST-запрос с данными лида.
2. **AI Agent на Groq** — читает заявку и возвращает один из трёх ярлыков: «холодный», «тёплый», «горячий».
3. **Switch** — три правила по полученному ярлыку:
   - **холодный** → автоматическое письмо через Gmail + лог в Google Sheets (для аналитики воронки).
   - **тёплый** → email через Gmail без участия менеджера.
   - **горячий** → уведомление менеджеру в Telegram + HTTP Request в Bitrix24 REST API для создания сделки.

### Что интересно

**Классификатор — не regex и не набор правил, а LLM.** Заявки реально приходят в расплывчатой форме: «подумаю», «нужно срочно», «сколько примерно стоит», «у нас бюджет ограничен, но интересно». Regex такое не разбирает, а набор if-правил разрастается до неподдерживаемого состояния. LLM читает заявку в контексте и назначает температуру так, как это сделал бы живой менеджер.

**Разная нагрузка на менеджера по температуре лида.** Горячий лид = моментальная сделка в CRM + Telegram-пинг; менеджер получает контакт на руки в тот же момент, когда заявка пришла. Тёплый = тихий email клиенту без привлечения менеджера. Холодный = никакого участия менеджера вообще, только запись в лог. Так бóльшая часть рутины снимается с sales-отдела, а внимание концентрируется на том, кто реально готов покупать.

**Webhook как универсальная точка входа.** Один URL — и к нему подключается любой источник: Tilda-форма, Telegram-бот, чат на сайте, email-парсер. Не нужно переписывать воркфлоу под каждый канал.

### Стек

- `n8n` — оркестратор
- `Groq` — LLM-классификатор
- Webhook — точка входа
- `Gmail` — email-канал для холодных и тёплых лидов
- `Telegram Bot API` — уведомления менеджеру по горячим
- `Google Sheets` — лог холодных лидов
- `Bitrix24 REST API` — создание сделок по горячим

### Credentials, которые нужно настроить

- Groq API key
- Gmail OAuth2
- Telegram Bot с chat_id менеджера
- Google Sheets OAuth2
- Bitrix24: входящий webhook с правами на создание сделок

### Как запустить

1. `Workflows → Import from File` → [`workflow.json`](./workflow.json).
2. Настроить credentials.
3. В узлах Gmail — поменять адрес отправителя и шаблоны писем.
4. В узле Telegram — `chat_id` менеджера.
5. В узле HTTP Request к Bitrix24 — URL своего инстанса и параметры метода `crm.deal.add`.
6. Activate — получить URL вебхука и подключить к нему источники (форму, бота).

---

## 🇬🇧 In English

### Context

Incoming leads need to be split by temperature and routed to the right channel: cold into an automated email flow with a log for analytics, warm to a quiet email that doesn't tie up a manager, hot straight into CRM as a deal with a manager ping. Manually triaging submissions becomes a bottleneck: by the time a manager opens the lead, a hot prospect has already left for a competitor.

### System

```
Webhook
   ↓
AI Agent (Groq) — classifier
   ↓
  Switch (cold / warm / hot)
  ↙      ↓         ↘
cold    warm       hot
 ↓       ↓          ↓
Gmail   Gmail    Telegram (manager)
  +                  +
Sheets             HTTP Request → Bitrix24
                   (create deal)
```

1. **Webhook** — a universal entry point. Any form on a landing page, chatbot, or service can send a POST with the lead data.
2. **AI Agent on Groq** — reads the lead and returns one of three labels: "cold", "warm", "hot".
3. **Switch** — three rules based on the label:
   - **cold** → automated email via Gmail + log in Google Sheets (for funnel analytics).
   - **warm** → email via Gmail, no manager involvement.
   - **hot** → Telegram alert to the manager + HTTP Request to the Bitrix24 REST API to create a deal.

### What's interesting

**The classifier isn't a regex or a rule set — it's an LLM.** Real submissions come in vague form: "just thinking about it", "need it urgently", "roughly how much", "tight budget but interested". Regex can't parse this; a pile of if-rules grows unmaintainable fast. The LLM reads the lead in context and assigns a temperature the way a live sales manager would.

**Manager load scales with lead temperature.** Hot lead = instant deal in the CRM + Telegram ping; the manager gets the contact in hand the moment the submission lands. Warm = a quiet email to the customer without pulling the manager in. Cold = no manager involvement at all, just a log entry. This removes most of the routine from the sales team and concentrates their attention on prospects who are actually ready to buy.

**Webhook as a universal entry point.** One URL — and any source hooks into it: a Tilda form, a Telegram bot, a site chat, an email parser. No need to rewrite the workflow per channel.

### Stack

- `n8n` — orchestrator
- `Groq` — LLM classifier
- Webhook — entry point
- `Gmail` — email channel for cold and warm leads
- `Telegram Bot API` — manager alerts for hot leads
- `Google Sheets` — cold-leads log
- `Bitrix24 REST API` — deal creation for hot leads

### Credentials to configure

- Groq API key
- Gmail OAuth2
- Telegram Bot with the manager's chat_id
- Google Sheets OAuth2
- Bitrix24: inbound webhook with permission to create deals

### How to run

1. `Workflows → Import from File` → [`workflow.json`](./workflow.json).
2. Configure the credentials.
3. In the Gmail nodes — set the sender address and email templates.
4. In the Telegram node — the manager's `chat_id`.
5. In the HTTP Request to Bitrix24 — your instance URL and `crm.deal.add` method parameters.
6. Activate, grab the webhook URL, and point your sources (form, bot) at it.
