# Zephyr 🚀

> **The gentle breeze that ships your stack.**
>
> *Formerly known as Project Skyrocket / FullStackBreeze*

![Status](https://img.shields.io/badge/Status-Pre--Alpha-orange) ![License](https://img.shields.io/badge/License-MIT-blue) ![Laravel](https://img.shields.io/badge/Backend-Laravel_11-red) ![Next.js](https://img.shields.io/badge/Frontend-Next.js_14+-black)

<img src="logo.png" alt="Zephyr Logo" width="250"/>

## 📖 About

**Zephyr** is a development acceleration engine designed to bridge the gap between database design and a functional full-stack application.

By defining a simple JSON schema, Zephyr automates the creation of:
* **Database Structure:** Migrations and Eloquent Models.
* **API Layer:** RESTful Controllers and API Routes protected by Sanctum.
* **Frontend UI:** Next.js pages with Tailwind CSS for full CRUD operations.

It eliminates the "boilerplate fatigue" of setting up Laravel Breeze and Next.js projects, letting you focus on business logic immediately.

---

## ⚡ Features (Roadmap v1.0)

- [x] **Laravel Breeze + Next Breeze Integration:** Pre-configured authentication stack.
- [ ] **Schema-to-DB Engine:** Converts `schema.json` to Laravel Migrations & Models.
- [ ] **Auto-API:** Generates standardized REST controllers (`index`, `store`, `update`, `destroy`).
- [ ] **Dynamic Frontend:** Generates React/Next.js forms and tables based on data types.
- [ ] **Docker Orchestration:** Single-command setup (`./zephyr install`).

## 🛠 Tech Stack

* **Backend:** Laravel 11, PHP 8.2+
* **Frontend:** Next.js (App Router), React, Tailwind CSS
* **Database:** MySQL / PostgreSQL
* **Environment:** Docker & Docker Compose

---

## 🚀 Getting Started (Prototype)

*Note: This project is currently under active development. The instructions below refer to the upcoming Alpha release (Dec 20, 2025).*

### 1. Define your Schema
Create a `schema.json` file in the root directory:

```json
{
  "resources": [
    {
      "name": "Product",
      "table": "products",
      "fields": [
        { "name": "title", "type": "string", "required": true },
        { "name": "price", "type": "decimal", "precision": 8, "scale": 2 },
        { "name": "is_active", "type": "boolean", "default": true }
      ]
    }
  ]
}
