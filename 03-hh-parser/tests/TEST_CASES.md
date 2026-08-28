# Manual test scenarios

| ID | Scenario | Input / precondition | Expected result | Covered failure mode |
|---|---|---|---|---|
| VP-01 | Strong match | Remote vacancy, salary at least 100000, AI score at least 60 | Vacancy appears in the recommended digest | — |
| VP-02 | Low salary | Salary below the deterministic threshold | Vacancy goes to manual-review digest | Objective filter |
| VP-03 | Office-only role | Schedule is not `Удаленная работа` | Vacancy goes to manual-review digest | Objective filter |
| VP-04 | Malformed AI JSON | Model returns invalid JSON | Parser assigns score 0 and manual-review fallback | Malformed AI output |
| VP-05 | Empty HH result | API returns an empty `items` array | Workflow produces no vacancy items; no false recommendations | Empty result |
| VP-06 | HH API error | API returns 429/5xx | Execution fails at the HTTP node and is visible in n8n history | External API failure |
| VP-07 | Partial loop failure | One model call fails inside a batch | Failed item requires rerun/manual review; no durable checkpoint exists | Partial loop failure |
| VP-08 | Missing salary | Vacancy has `salary: null` | Normalized salary is null and deterministic filter rejects it | Optional field absent |
