# Manual test scenarios

| ID | Scenario | Input / precondition | Expected result | Covered failure mode |
|---|---|---|---|---|
| RAG-01 | Successful ingestion | Supported PDF is available in Google Drive | Text is chunked and inserted into Supabase | — |
| RAG-02 | Successful retrieval | Question closely matches an indexed chunk | Agent uses vector-store tool and returns a concise answer | — |
| RAG-03 | Irrelevant question | Question has no useful knowledge-base match | Prompt asks for the no-information fallback; verify manually because no score gate exists | No relevant context |
| RAG-04 | Empty store | Query before ingestion | Agent should return the fallback; no deterministic guard exists | Empty dependency |
| RAG-05 | Duplicate ingestion | Run ingest twice for the same document | Duplicate chunks can be inserted; deduplication is not implemented | Duplicate / replay |
| RAG-06 | Model failure | Groq credential is invalid or model times out | Query execution fails; no operator alert path is configured | Model failure |
| RAG-07 | Telegram failure | Bot cannot send the answer | Execution records Telegram error; Sheets logging after send may not run | Partial side-effect failure |
| RAG-08 | Prompt injection | User asks the agent to ignore the knowledge base | Verify the prompt boundary; no dedicated injection filter exists | Untrusted user input |
| RAG-09 | Untrusted document | Indexed PDF contains malicious instructions | Treat content as data; current workflow has no ingestion-time safety filter | Untrusted source document |
