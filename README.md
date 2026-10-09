# Posts API

A small backend that demonstrates a clean **Domain-Driven Design** structure, an **event-driven** flow with **Apache Kafka**, persistence in **MongoDB**, and a fully **Dockerized** setup deployed on **AWS**.

Creating a post stores it in MongoDB and publishes a `PostCreated` event to Kafka. A separate consumer process receives the event and processes it.

| | |
|---|---|
| **Stack** | Node.js 22 (ESM), Express 5, MongoDB 7, Apache Kafka 3.9 (KRaft), Docker, Docker Compose |
| **Live deployment** | `http://3.78.228.27/`  (AWS EC2) |
| **Postman collection** | [`postman/`](postman/): collection + `Local` and `AWS` environments |

---

## Architecture

```
                    ┌────────────────────────── docker compose ──────────────────────────┐
                    │                                                                    │
 HTTP client ─────► │  api  ──────────────────────────────────►  mongo   (posts_db.posts)│
 (Postman, curl)    │   │                                                                │
                    │   │ publish PostCreated                                            │
                    │   ▼                                                                │
                    │  kafka  [topic: posts.created]  ──────────►  consumer              │
                    │                                              (logs / processes)    │
                    └────────────────────────────────────────────────────────────────────┘
```

Request flow for `POST /api/posts`:

```
Controller ─► CreatePost use case ─► Post.create (business rules)
                    │
                    ├─► PostRepository ─► MongoPostRepository ─► MongoDB
                    └─► EventPublisher ─► KafkaEventPublisher ─► Kafka ─► Consumer
```

### DDD layers

Dependencies point **inwards only**: `api → application → domain ← infrastructure`. The domain imports nothing from Express, MongoDB or Kafka.

| Layer | Responsibility | Contents |
|---|---|---|
| **Domain** | Business concepts and rules, no technology | `Post` entity (factory + validation), `PostRepository` contract, `PostCreated` event, domain errors |
| **Application** | Use cases: what the system can do | `CreatePost`, `GetPost`, `ListPosts`, `ProcessPostCreated`, `EventPublisher` port |
| **Infrastructure** | Technology adapters that implement the ports | `MongoPostRepository`, `InMemoryPostRepository`, `KafkaEventPublisher`, `KafkaEventConsumer` |
| **API** | HTTP translation only | Express routes, controllers, error-handling middleware |

### Folder structure

```
src/
├── domain/post/
│   ├── Post.js                    entity; Post.create() enforces the rules
│   ├── PostRepository.js          repository contract
│   ├── PostCreated.js             domain event
│   └── errors.js                  ValidationError, PostNotFoundError
├── application/
│   ├── ports/EventPublisher.js    contract for announcing events
│   └── post/                      CreatePost, GetPost, ListPosts, ProcessPostCreated
├── infrastructure/
│   ├── database/                  MongoPostRepository, InMemoryPostRepository, mongoClient
│   └── messaging/                 kafkaClient, KafkaEventPublisher, KafkaEventConsumer
├── api/
│   ├── controllers/               postController
│   ├── routes/                    postRoutes
│   └── middleware/                errorHandler (domain error → HTTP status)
├── app.js                         builds the Express app from the use cases it is given
├── server.js                      composition root of the API process
├── consumer.js                    composition root of the consumer process
└── config.js                      the only file that reads process.env
tests/                             unit + integration tests (node:test)
Dockerfile · docker-compose.yml · .env.example
```

---

## API

Base path: `/api/posts`. All bodies are JSON.

### `POST /api/posts`  Create a post

```json
{ "title": "Learning Kafka", "content": "This is my first event-driven backend." }
```

`201 Created`
```json
{
  "id": "ff1346c9-e150-42f6-a1f4-b920089c05c7",
  "title": "Learning Kafka",
  "content": "This is my first event-driven backend.",
  "createdAt": "2026-10-08T15:58:51.608Z"
}
```
Rules: `title` required (max 200 chars), `content` required; both are trimmed.

### `GET /api/posts/:id`  Get one post
`200 OK` with the post, or `404 Not Found`.

### `GET /api/posts`  List posts
`200 OK` with an array, newest first.

### Status codes

| Code | When |
|---|---|
| `201` | post created |
| `200` | successful read |
| `400` | validation failed or malformed JSON, body: `{ "error": "title is required" }` |
| `404` | unknown post id or route |
| `500` | unexpected error (details are logged, never returned) |

`GET /` returns `{"status":"ok","service":"posts-api"}` and is used as the health check.

---

## Event flow (Kafka)

- **Topic:** `posts.created` (created automatically at startup if missing)
- **Producer:** the API, after the post is saved. Message key = post id, so events about one post stay ordered.
- **Consumer:** a separate process, consumer group `posts-consumer`. It parses the event and runs `ProcessPostCreated`, which logs it.

Event payload:
```json
{
  "eventType": "PostCreated",
  "postId": "ff1346c9-e150-42f6-a1f4-b920089c05c7",
  "title": "Learning Kafka",
  "createdAt": "2026-10-08T15:58:51.608Z"
}
```

Consumer output:
```
Received PostCreated event | Post ID: ff1346c9-... | Title: Learning Kafka | Created at: 2026-10-08T15:58:51.608Z
```

Because Kafka stores events and tracks each group's offset, a consumer that is stopped while posts are created receives the missed events when it restarts.

---

## Running with Docker (recommended)

Requires Docker with the Compose plugin.

```bash
git clone https://github.com/Hagerh/Backend_system.git
cd Backend_system
docker compose up -d --build
docker compose ps          # wait until api, kafka and mongo are "healthy"
```

| Service | Container | Host port |
|---|---|---|
| API | `posts-api` | `3000` (change with `API_PORT=8080 docker compose up -d`) |
| Consumer | `posts-consumer` | none |
| Kafka | `posts-kafka` | `9092` |
| MongoDB | `posts-mongo` | `27018` (for inspecting with Compass; remove on a public server) |

Try it:
```bash
curl -i -X POST http://localhost:3000/api/posts \
  -H 'Content-Type: application/json' \
  -d '{"title":"Hello","content":"First post"}'

docker compose logs -f consumer      # shows "Received PostCreated event ..."
```

Stop everything: `docker compose down` (add `-v` to also delete the MongoDB data).

Inside Compose the services reach each other by name (`mongo:27017`, `kafka:29092`), configured through environment variables in `docker-compose.yml`. No `.env` file is copied into the image.

---

## Running locally (without containers for the app)

Requires Node.js 20+ (22 recommended), plus a MongoDB and a Kafka broker.

```bash
npm install
cp .env.example .env
docker compose up -d mongo kafka      # or use your own MongoDB on :27017
```
If you use Compose's MongoDB, set `MONGODB_URI=mongodb://localhost:27018` in `.env`.

```bash
npm run dev          # API on http://localhost:3000 (restarts on file changes)
npm run consumer     # in a second terminal
```

### Environment variables

Copy `.env.example` to `.env`. `.env` is git-ignored and must never be committed.

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | HTTP port of the API |
| `MONGODB_URI` | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGODB_DB` | `posts_db` | database name |
| `KAFKA_BROKERS` | `localhost:9092` | comma-separated broker list |
| `KAFKA_CLIENT_ID` | `posts-api` | client id shown to the broker |
| `KAFKA_TOPIC` | `posts.created` | topic for `PostCreated` events |
| `KAFKA_GROUP_ID` | `posts-consumer` | consumer group of the consumer process |

---

## Tests

```bash
npm test
```

| Level | What it checks | Needs |
|---|---|---|
| Unit | domain rules, use cases, event publishing, failure handling | nothing |
| API | all endpoints and status codes on a real Express app (in-memory repository) | nothing |
| Integration | `MongoPostRepository` against a throwaway database | MongoDB |
| Integration | publish → Kafka → consumer round trip on a throwaway topic | Kafka |

Integration tests skip themselves when MongoDB or Kafka is not reachable.

---

## Deployment (AWS)

The whole stack runs on a single **EC2** instance (Amazon Linux 2023) with Docker Compose.

- Security group: port `80` open to the internet (API), port `22` for administration. MongoDB and Kafka are **not** exposed.
- Started with `API_PORT=80 docker compose up -d --build`; containers restart automatically (`restart: unless-stopped`).
- Public URL: `http://3.78.228.27/`, for example `http://3.78.228.27/api/posts`.

Steps to reproduce:
1. Launch an EC2 instance, open ports 22 and 80.
2. Install Docker, Git, the Compose plugin and the **buildx** plugin (Amazon Linux's Docker is too old for Compose's `build`; install buildx v0.17+ into `/usr/local/lib/docker/cli-plugins/`). Add 2 GB of swap if the instance has about 1 GB of RAM (this deployment runs on a `t3.micro`).
3. `git clone` the repository, then `sudo docker compose build api` and `sudo API_PORT=80 docker compose up -d`.
4. Verify with `sudo docker compose ps` (api, kafka and mongo `healthy`) and `curl http://<public-ip>/`.

---

## Design decisions and limitations

- **Factory vs constructor.** `Post.create()` validates new input and generates `id`/`createdAt`; the constructor only restores stored data, so tightening a rule never breaks reading old posts.
- **UUID identifiers** keep identity inside the domain instead of depending on MongoDB's `ObjectId`.
- **Ports and adapters.** Use cases depend on `PostRepository` and `EventPublisher` contracts. MongoDB and Kafka can be replaced without touching the domain or use cases. The same use cases run in tests with in-memory fakes.
- **Event publishing after saving.** If Kafka is unavailable the post is still stored and the request succeeds; the failure is logged. This is the classic *dual-write* trade-off. The standard fix is the transactional outbox pattern, left out to keep the project small.
- **At-least-once delivery.** A consumer may rarely see an event twice. The current handler only logs, so this is harmless; a handler with side effects would need to be idempotent.
- **Single broker, single partition.** Fine for the exercise, not for production throughput or availability.
- **Not included:** authentication, pagination on the list endpoint, rate limiting, HTTPS, MongoDB authentication, dead-letter topics. These are deliberate omissions for scope.
- **Security basics:** secrets stay out of git (`.env` ignored, no `.env` inside the image), containers run as a non-root user, `X-Powered-By` is disabled.
