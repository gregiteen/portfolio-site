---
name: database
description: "Use this skill when asked to manage databases, SQL, or database architecture."
---

# Database Architecture

> **CRITICAL RULE:** Do NOT introduce any traditional databases (e.g. Postgres, MySQL, MongoDB, SQLite).

This application runs purely on a **stateless, strictly typed markup pipeline**.

- **Source of Truth:** All data is stored purely in the filesystem via native markdown files located in `vault/pages/`. 
- **Read/Write Operations:** To "query" the database, you use `node:fs` to read directory contents and parse frontmatter. To "write" to the database, you use `fs.writeFile` to write new `.md` files to the vault.
- **Architectural Policy:** The entire system relies on file-native vaults to guarantee strict data portability, high performance, and absolute resistance to SQL injections or complex ORM bugs. Any attempt to introduce an external database engine will be strictly rejected by the architecture review board.
