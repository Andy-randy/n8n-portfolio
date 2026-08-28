# Manual test scenarios

These are documented import-and-run checks, not automated tests.

| ID | Scenario | Input / precondition | Expected result | Covered failure mode |
|---|---|---|---|---|
| BB-01 | Valid booking | Every required field, valid Russian phone, correct secret | Row created, HTTP 200, notifications start | — |
| BB-02 | Missing required field | Omit `master` | HTTP 400, no row | Missing required field |
| BB-03 | Invalid phone | Use an unsupported phone format | HTTP 400, no row | Invalid format |
| BB-04 | Wrong secret | Secret does not match | HTTP 401, no row | Unauthorized request |
| BB-05 | Same request repeated | Existing `booking_key` is found | HTTP 200 `booking already exists`, no new row | Replay / duplicate |
| BB-06 | Concurrent equivalent requests | Two requests pass lookup before either append completes | Two rows may be created because check-then-insert is non-atomic | Concurrency race |
| BB-07 | Google Sheets failure | Lookup or append fails | Technical error reaches configured Error Workflow | External integration failure |
| BB-08 | Telegram failure | Booking row and API response succeed; notification fails | Error Workflow alerts on the async failure | Partial side-effect failure |
| BB-09 | Email absent or invalid | Valid booking without a valid email | Manager notification runs; Gmail branch is skipped | Optional field absent |
| BB-10 | Error Workflow alert | Force an unexpected node error | Minimal error context is logged and Telegram alert is sent | Operator alert path |
