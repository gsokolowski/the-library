# The Library

Small **Laravel 13** demo: **GraphQL CRUD** for books (**Lighthouse**), **Redis** caching for the `books` list query, and **RabbitMQ** event-style messages on create/update/delete (via **php-amqplib**).

This project is standalone under `the-library` and is unrelated to **the-shop**.

## Requirements

- PHP **8.3+**, Composer, **pdo_mysql**, and **MySQL 8+** or **MariaDB 10.4+**.
- Optional: **Docker** for Redis + RabbitMQ (`docker compose up -d`).

## Quick start

Create the database (name includes a hyphen, so use backticks in SQL):

```sql
CREATE DATABASE `the-library` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then:

```bash
cd /path/to/the-library
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Default `.env` uses `DB_CONNECTION=mysql` and `DB_DATABASE=the-library`. For MariaDB you can set `DB_CONNECTION=mariadb` instead.

Tests still use **SQLite in-memory** (`phpunit.xml`), so `php artisan test` does not require MySQL.

**GraphQL endpoint:** `POST http://127.0.0.1:8000/graphql`  
Set header: `Content-Type: application/json` (and `Accept: application/json`).

### Optional: Redis + RabbitMQ

```bash
docker compose up -d
```

In `.env`:

- `CACHE_STORE=redis` (with `REDIS_CLIENT=predis` or `phpredis`).
- `RABBITMQ_ENABLED=true` and check `RABBITMQ_*` match your broker.

Exchange: **`library.events`** (topic). Routing keys: **`book.created`**, **`book.updated`**, **`book.deleted`**. Messages are persistent JSON.

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
php artisan test
```

Tests use `CACHE_STORE=array` and `RABBITMQ_ENABLED=false` (see `phpunit.xml`).
