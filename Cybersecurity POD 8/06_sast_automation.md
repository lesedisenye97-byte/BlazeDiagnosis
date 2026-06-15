# Task 6: DevSecOps Framework & Automated Security Testing (SAST)
This document maps out the deployment plan to transition Blaze Diagnostics away from manual, human-error-prone visual inspections toward fully automated guardrails within the continuous integration pipeline.
## 1. Static Application Security Testing (SAST) Pipeline
* **Continuous Scanning Engine:** Integrate an automated code analysis engine (such as CodeQL or SonarQube) directly into the repository's GitHub Actions continuous integration framework.
* **Defensive Scope:** Every single outbound pull request must trigger an automated security compile pass. The scanner will parse codebase branches to flag high-risk software flaws before they can be merged into production code, checking specifically for:
    *  Unsafe regular expression processing (Regular Expression Denial of Service - ReDoS).
    *  JavaScript/TypeScript prototype pollution vectors.
    *  Unsanitized data execution paths that permit raw SQL injection or break object authorization parameters.
## 2. Pre-Commit Secrets Interception & Hygiene
To secure backend authentication configurations, automated gating mechanisms must stop credential leaks before they ever reach a remote server.
* **Tooling Implementation:** Deploy **TruffleHog** or **GitLeaks** scanning nodes coupled with **Husky** git hooks directly into the development workspace configuration.
* **Pre-Commit Enforcement Protocol:** When a developer executes a localized `git commit` command, the internal hooks instantly scan the modified code blocks. If the parser intercepts raw connection parameters (`postgresql://`), explicit admin values, or plaintext signing keys, the commit execution is automatically aborted. The developer is barred from pushing the patch until the configuration environment parameters are properly scrubbed and abstracted to a secure `.env` reference.
