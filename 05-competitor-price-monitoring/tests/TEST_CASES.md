# Manual test scenarios

| ID | Scenario | Input / precondition | Expected result | Covered failure mode |
|---|---|---|---|---|
| PM-01 | Price unchanged | Current normalized price equals stored price | No change alert is created | — |
| PM-02 | Price increase | Current price is higher than stored price | Difference is calculated and an alert is sent | — |
| PM-03 | Price decrease | Current price is lower than stored price | Difference is calculated and an alert is sent | — |
| PM-04 | Missing price | Selector returns a product without a parseable price | Item is rejected or routed to the no-products warning | Malformed source data |
| PM-05 | Malformed HTML | Page layout no longer matches selectors | No-products warning is sent; selector requires maintenance | Site change |
| PM-06 | Source timeout | Competitor request times out | HTTP retry settings apply; final failure remains visible | External timeout |
| PM-07 | Duplicate product | Source returns the same normalized product twice | Duplicate rows/alerts are possible; no unique constraint exists | Duplicate data |
| PM-08 | AI output failure | Price changed but model call fails | Alert enrichment fails; no deterministic summary fallback exists | Model failure |
| PM-09 | Blocked request | Source returns 403 or challenge page | HTML check fails and operator receives a warning | Access restriction |
