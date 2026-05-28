# Codag

**One-Liner:** Systems log compression for agents

**Description:** Codag is a developer tool that compresses infrastructure log data into structured incident summaries for AI agents like Claude Code. The core problem: agents are great at debugging until they hit the logs. For individuals, logs are too costly to read — every read burns tokens and context, and the window fills with routine noise before reaching the answer. For platforms and infra, logs are too big to read — millions of lines a day that never fit in the context window at all. Codag returns schema-valid JSON "IncidentCapsules" with 95% fewer log tokens while preserving debugging signal. Every line kept points to a real line number, tagged by its role in the incident (root_cause, trigger, consequence). Nothing is summarized away, nothing invented. Drop-in over HTTPS, MCP-compatible, integrates with Claude Code hooks automatically. Works with Vercel, AWS CloudWatch, Railway, Kubernetes, Docker, Datadog, Sentry, journalctl, and any stdout. Founded by Michael Zhou in 2026, based in San Francisco.

**Batch:** Summer 2026

**Industry:** B2B Infrastructure / DevTools

**Tags:** log-compression, AI-agents, incident-management, DevOps, MCP

**Indian Clone Potential:** Indian SaaS companies running on AWS/Azure could benefit from log compression to reduce cloud costs. Build an India-focused version with support for local cloud providers (DigitalOcean, Linode) and vernacular incident summaries for Indian ops teams.

**Source:** YC Startup Directory + codag.ai