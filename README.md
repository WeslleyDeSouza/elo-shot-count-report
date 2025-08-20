# ELO Schusszahlmeldung

The ELO Schusszahlmeldung project modernizes the Swiss Army’s shooting range management system. It introduces a custom-built Progressive Web App (PWA) that allows recruits to digitally report their shooting scores, replacing paper-based processes. The application provides administrators with real-time oversight, detailed reporting, and efficient management tools. Built with NestJS, Angular, TypeORM, and NX, the system ensures scalability, security, and user-friendliness. This digital transformation significantly improves accuracy, efficiency, and the overall shooting range experience.

![Banner](https://desouza.ch/wp-content/uploads/2025/02/Mockup.png)

### User Story

```mermaid
journey
  title Collection Entry Wizard (Public)
  section Tenant Selection
    Choose tenant: 5: User
  section Login / Personal Info
    Enter name, PIN, responsible, unit: 4: User
    Validate PIN via API: 3: System
  section Date & Location
    Select shooting range & area: 4: User
    Pick date & time slots: 3: User
    Load available areas: 3: System
  section Ammunition & Weapons
    Add weapons & quantities: 4: User
    Load weapons by area: 3: System
    Validate at least one weapon: 3: System
  section Summary
    Review all entries: 5: User
    Submit collection entry: 4: User
    Create collection via API: 3: System
  section Success
    Show success screen: 5: System
    Option to start new entry: 3: User
````

### Architecture

```mermaid
---
title: Architecture
---
flowchart LR

%% entities
    FE[Angular app]:::app
    LB[Nginx Proxy]:::proxy

    subgraph OS [Orders service]
    direction TB
    subgraph O [API]
        direction LR
        OA[Admin API]:::service
        OP[Public API]:::service
    end
    O --> O-M[(MySQL)]
    end

%% flow
    FE -->|HTTP| LB -->|HTTP| O
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

