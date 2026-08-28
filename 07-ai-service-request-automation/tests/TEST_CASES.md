# Manual test scenarios

| ID | Scenario | Input / precondition | Expected result | Covered failure mode |
|---|---|---|---|---|
| SR-01 | Urgent request | Valid request describes leak, smoke, or electrical risk | `🔴 срочно`, Sheets row, manager alert, HTTP 200 | — |
| SR-02 | Today request | Appliance is unusable without immediate hazard | `🟡 сегодня`, Sheets row, optional email, HTTP 200 | — |
| SR-03 | Later request | Consultation or noncritical symptom | `🟢 можно позже`, Sheets row, HTTP 200 | — |
| SR-04 | Missing request text | Required description is empty | Validation error, HTTP 400 | Missing required field |
| SR-05 | Invalid phone | Phone fails the validation regex | Validation error, HTTP 400 | Invalid format |
| SR-06 | Wrong secret | Secret does not match | HTTP 401 | Unauthorized request |
| SR-07 | Malformed AI JSON | Model returns prose | Manager alert and HTTP 500 | Malformed model output |
| SR-08 | Unsupported urgency | JSON contains another urgency value | Parser rejects schema, manager alert, HTTP 500 | Contract violation |
| SR-09 | Sheets failure | Category-specific append fails | HTTP 500 on branches that expose a storage error | External integration failure |
| SR-10 | Email absent | Valid request has no email | Gmail path is skipped | Optional field absent |
