# Manual test scenarios

These scenarios document expected behavior; they are not automated tests.

| ID | Scenario | Input / precondition | Expected result | Covered failure mode |
|---|---|---|---|---|
| LP-01 | Hot lead with budget | Valid query parameters and concrete budget | Manager alert, CRM request, HTTP 200 | — |
| LP-02 | Hot lead without budget | Valid request with strong buying intent, no budget | Alternate CRM payload, HTTP 200 | Optional field absent |
| LP-03 | Warm lead | Valid exploratory request | Follow-up email, Sheets log, HTTP 200 | — |
| LP-04 | Cold lead | General interest without a concrete task | Nurture email, Sheets log, HTTP 200 | — |
| LP-05 | Missing required field | Omit phone or request | AI is skipped, HTTP 400 | Business validation failure |
| LP-06 | Invalid email | Malformed email address | AI is skipped, HTTP 400 | Invalid format |
| LP-07 | Wrong secret | `secret` does not match `YOUR_API_SECRET` | HTTP 400 through the current validation branch | Unauthorized request |
| LP-08 | Malformed model JSON | Model returns prose or an unsupported temperature | Admin alert, manual-review response, HTTP 500 | Malformed AI output |
| LP-09 | CRM timeout | Hot branch CRM endpoint times out | Execution fails at CRM call; no compensating transaction exists | External integration failure |
| LP-10 | Duplicate lead | Repeat the same valid request | A second side effect can occur; deduplication is not implemented | Replay / duplicate |
