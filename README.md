# ELO Schusszahlmeldung

The ELO Schusszahlmeldung project modernizes the Swiss Army’s shooting range management system. It introduces a custom-built Progressive Web App (PWA) that allows recruits to digitally report their shooting scores, replacing paper-based processes. The application provides administrators with real-time oversight, detailed reporting, and efficient management tools. Built with NestJS, Angular, TypeORM, and NX, the system ensures scalability, security, and user-friendliness. This digital transformation significantly improves accuracy, efficiency, and the overall shooting range experience.

![Banner](https://desouza.ch/wp-content/uploads/2025/02/Mockup.png)

### Architecture

```mermaid
---
title:  Project Architecture
---
flowchart LR

%% styles
classDef app fill:#f7e081,stroke:#333,stroke-width:1px
classDef proxy fill:#cce5ff,stroke:#333,stroke-width:1px
classDef backend fill:#d5f5e3,stroke:#333,stroke-width:1px
classDef db fill:#f9e79f,stroke:#333,stroke-width:1px

%% edge flow
FE[Angular FE]:::app -->|HTTP| LB[Nginx Proxy]:::proxy

subgraph BE[Backend]
direction TB
NX[NestJS]:::backend
ADM[Admin Modules]:::backend
PUB[Public Modules]:::backend
DB[(MySQL)]:::db

%% internal wiring
NX --> ADM
NX --> PUB
NX --> DB
end

LB -->|HTTP| NX
```

### Entity - UML

```mermaid
---
title: Entities namespaces and relationships
---
classDiagram

Comming Soon
```
----

### Configurations
| Category  | Path  |
|-----------|-------|
| **Env**   | `.env` |
| **Docker** | `config/docker` |
| **Swagger** | `config/swagger (generated)` |

----

### Preparation

Copy ``.env.example`` to `.env`

----
### Getting started | Setup

**With Docker:**

Run Docker:
``docker-compose -f ./config/docker/docker-compose.yml up``


**Without Docker:**


**Running:**
Run specific Application:
``npx nx serve [APPNAME]``

Run ui Applications:
`` npx nx run-many -t=serve -p=app*``

Run api Applications:
`` npx nx run-many -t=serve -p=api*``

**Test:**

Run ui Tests:
`` npx nx run-many -t=test -p=app*``

Run api Tests:
`` npx nx run-many -t=test -p=api*``

----

### Tools

| Name        | Path | Example              |
|-------------|------|----------------------|
| **swagger** | `tools/swagger.generator.js` | `npm run ng-swagger` |

