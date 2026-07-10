# The Library

Small **Laravel 13** demo: **GraphQL CRUD** for books (**Lighthouse**), **Redis** caching for the `books` list query, and **RabbitMQ** event-style messages on create/update/delete (via **php-amqplib**).

This project is standalone under `the-library` and is unrelated to **the-shop**.

## Repository layout

- **`backend/`** — Laravel API (GraphQL at `POST /graphql`, default `http://127.0.0.1:8000/graphql` with `php artisan serve`).
- **`frontend/`** — Vite + React app that talks to the API (dev server proxies `/graphql` to the backend).

## Requirements

- PHP **8.3+**, Composer, **Node 20+**, **pnpm/npm**, **pdo_mysql**, and **MySQL 8+** or **MariaDB 10.4+**.
- **Docker Desktop** (or another Docker engine) for **Redis**, which the default cache (`CACHE_STORE=redis`) expects. Use `CACHE_STORE=file` in `.env` if you run without Redis.

## Quick start

Create the database (name includes a hyphen, so use backticks in SQL):

```sql
CREATE DATABASE `the-library` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then the **Laravel** app:

```bash
cd /path/to/the-library/backend
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
composer redis-up          # start Redis (Docker must be running): docker compose up -d redis
php artisan config:clear   # pick up CACHE_STORE=redis after .env edits
php artisan serve
```

**React UI** (second terminal; needs the API running):

```bash
cd /path/to/the-library/frontend
cp .env.example .env   # adjust VITE_BACKEND_URL if not using http://127.0.0.1:8000
npm install
npm run dev
```

Open **http://localhost:5173**. The welcome page at the API root links here via `FRONTEND_URL` in `backend/.env` (default `http://localhost:5173`). Visiting **`/library`** on the API redirects to that URL.

Default `.env` uses `DB_CONNECTION=mysql` and `DB_DATABASE=the-library`. For MariaDB you can set `DB_CONNECTION=mariadb` instead.

Tests still use **SQLite in-memory** (`phpunit.xml`), so `php artisan test` does not require MySQL.

**GraphQL endpoint:** `POST http://127.0.0.1:8000/graphql`  
Set header: `Content-Type: application/json` (and `Accept: application/json`).

This project defaults **`LIGHTHOUSE_QUERY_CACHE_MODE=opcache`** (parsed queries on disk under `bootstrap/cache`). Do **not** use **`store`** for that cache with Redis: PHP can deserialize old entries as **`__PHP_Incomplete_Class`** and break every request until you **`php artisan cache:clear`**.

### Redis (default) and optional RabbitMQ

**`.env`** / **`.env.example`** use **`CACHE_STORE=redis`** (with **Predis**) for the `books` list cache and Lighthouse query parse cache. Start Redis first:

```bash
cd /path/to/the-library/backend
composer redis-up
# same as: docker compose up -d redis
```

Requires **Docker Desktop** (or daemon on `unix:///var/run/docker.sock`). Redis listens on **`127.0.0.1:6379`** (see `REDIS_*` in `.env`).

If Redis is unavailable, switch to **`CACHE_STORE=file`** (no Docker) until Redis is running.

#### Optional: RabbitMQ as well

```bash
docker compose up -d
```

In `.env`:

- `RABBITMQ_ENABLED=true` and check `RABBITMQ_*` match your broker.

Exchange: **`library.events`** (topic). Routing keys: **`book.created`**, **`book.updated`**, **`book.deleted`**, **`book.borrowed`**, **`book.returned`** (borrow/return when `library_user_id` changes). Messages are persistent JSON.

**Waitlist consumer** (separate terminal, with RabbitMQ enabled):

```bash
php artisan library:consume-waitlist
```

Listens on queue **`library.waitlist`** for `book.returned` and `book.borrowed`. On return, notifies the next waiting library user; on borrow, marks their waitlist entry fulfilled. When `RABBITMQ_ENABLED=false`, the same logic runs synchronously in `BookObserver` (used by tests and local dev without a consumer).

Management UI (guest/guest): http://127.0.0.1:15672  

If RabbitMQ is disabled or unreachable, writes still succeed; failures are logged as `rabbitmq.publish_failed`.

## Example queries

**List books (cached 60s when using Redis):**

```json
{
  "query": "{ books { id title author } }"
}
```

**One book:**

```json
{
  "query": "query($id: ID!) { book(id: $id) { title author } }",
  "variables": { "id": "1" }
}
```

**Create:**

```json
{
  "query": "mutation($t: String!, $a: String!) { createBook(title: $t, author: $a) { id title } }",
  "variables": { "t": "My book", "a": "Me" }
}
```

## Why not `vladimir-yuldashev/laravel-queue-rabbitmq`?

That package hit a **Laravel 13 / `Worker::$currentJob` visibility** mismatch at install time. This repo **publishes to RabbitMQ directly** with `php-amqplib`, which is enough to demonstrate the broker and keeps `QUEUE_CONNECTION` on the default/simple drivers.

## Tests

```bash
cd /path/to/the-library/backend
php artisan test
```

Tests use `CACHE_STORE=array` and `RABBITMQ_ENABLED=false` (see `phpunit.xml`).
