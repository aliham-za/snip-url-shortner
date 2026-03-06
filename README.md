# Snip — URL Shortener with Analytics

A full-stack URL shortener with click analytics, custom subdomains, and an external API. Built with Rails 7 API + React 19 + Vite + TailwindCSS.

## Demo Account

```
Email: demo@example.com
Password: password123
```

## Tech Stack

- **Backend:** Ruby on Rails 7 (API mode), PostgreSQL, Sidekiq + Redis
- **Frontend:** React 19, Vite, TailwindCSS 4, Recharts
- **Auth:** Devise + JWT (dashboard), API Keys (external API)

## Features

- Shorten URLs with custom slugs and expiry dates
- Enable/disable links without deleting
- Custom subdomains for branded short links
- Click analytics: total clicks, unique clicks, clicks over time
- Top referrers, countries, browsers, and OS breakdown
- Dashboard with stats, search, sort, and pagination
- API key management with SHA256 hashing (raw key shown once)
- External API for programmatic URL shortening
- Postman collection included for API testing
- Rate limiting via Rack::Attack

## Setup

### Prerequisites

- Ruby 3.1+
- Node.js 18+
- PostgreSQL 14+
- Redis (for Sidekiq)

### Backend

```bash
cd backend
bundle install
cp .env .env.local
rails db:create db:migrate db:seed
rails server -p 3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3000`.

### Background Jobs (optional)

```bash
cd backend
bundle exec sidekiq
```

Without Sidekiq running, click tracking uses inline processing.

## API Endpoints

### Dashboard API (JWT Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Create account |
| POST | `/api/v1/auth/login` | Login |
| DELETE | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/links` | List links |
| POST | `/api/v1/links` | Create link |
| GET | `/api/v1/links/:id` | Link details |
| PATCH | `/api/v1/links/:id` | Update link |
| DELETE | `/api/v1/links/:id` | Delete link |
| PATCH | `/api/v1/links/:id/toggle` | Toggle active/inactive |
| GET | `/api/v1/links/:id/analytics` | Full analytics |
| GET | `/api/v1/links/:id/analytics/clicks` | Clicks over time |
| GET | `/api/v1/dashboard/stats` | Dashboard summary |
| GET | `/api/v1/api_keys` | List API keys |
| POST | `/api/v1/api_keys` | Create API key |
| DELETE | `/api/v1/api_keys/:id` | Revoke API key |
| GET | `/api/v1/subdomains` | List subdomains |
| POST | `/api/v1/subdomains` | Create subdomain |
| PATCH | `/api/v1/subdomains/:id` | Update subdomain |
| DELETE | `/api/v1/subdomains/:id` | Delete subdomain |

### External API (API Key Auth)

Pass your API key via the `X-Api-Key` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/external/shorten` | Shorten a URL |
| GET | `/:short_code` | Redirect to original URL |

**Shorten request body:**

```json
{
  "original_url": "https://example.com/long-url",
  "custom_slug": "my-link",
  "title": "My Link",
  "subdomain": "blog"
}
```

Only `original_url` is required. If `subdomain` doesn't exist, it's created automatically.

## Project Structure

```
project/
├── backend/
│   ├── app/
│   │   ├── blueprints/         # JSON serializers
│   │   ├── controllers/
│   │   │   ├── api/v1/         # JWT-authenticated endpoints
│   │   │   ├── api/v1/external/ # API key-authenticated endpoints
│   │   │   └── redirects_controller.rb
│   │   ├── models/             # User, ShortLink, Click, ApiKey, Subdomain
│   │   ├── jobs/               # Background click tracking
│   │   └── services/           # JWT encoding/decoding
│   └── config/
├── frontend/
│   ├── public/
│   │   └── snip-api-collection.json  # Postman collection
│   └── src/
│       ├── components/         # Navbar, LinkCard, Modals, Charts
│       ├── context/            # AuthContext
│       ├── lib/                # API client, hooks
│       └── pages/              # Dashboard, Analytics, ApiKeys, Subdomains
└── README.md
```

## Author

**Ali Hamza** — [@aliham-za](https://github.com/aliham-za)
