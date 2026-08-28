# Manual test scenarios

| ID | Scenario | Input / precondition | Expected result | Covered failure mode |
|---|---|---|---|---|
| FC-01 | Happy path with email | Valid name, phone, club, goal, secret and email | Lead row, manager notification, email, HTTP 200 | — |
| FC-02 | Happy path without email | Valid required fields; email omitted | Lead row and manager notification, no Gmail call, HTTP 200 | Optional field absent |
| FC-03 | Missing club | `club` is empty | Validation fails, error row, HTTP 400 | Missing required field |
| FC-04 | Invalid email | Email has invalid format | Lead is accepted, Gmail branch is skipped | Invalid optional field |
| FC-05 | Wrong secret | Secret does not match | HTTP 401 and no persistence | Unauthorized request |
| FC-06 | Sheets failure | Lead sheet is unavailable | Workflow fails before downstream notifications | External integration failure |
| FC-07 | Telegram failure | Lead row is written but manager notification fails | Persisted side effect remains; no compensation exists | Partial side-effect failure |
| FC-08 | Replayed request | Send the same valid request twice | Two rows can be created; idempotency is not implemented | Duplicate / replay |
