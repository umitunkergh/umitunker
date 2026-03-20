# CLAUDE.md — UU AI Satış Sözlüğü

Codebase guide for AI assistants working on this repository.

---

## Project Overview

**UU AI Satış Sözlüğü** (UU AI Sales Dictionary) is a full-stack AI-powered Turkish/English sales terminology platform. It provides intelligent search and expert answers for sales-related questions, powered by OpenAI GPT-4o.

- **Owner:** Ümit ÜNKER
- **Domain:** umitunker.com at path `/uuai`
- **Platform:** Emergent Agent

---

## Architecture

```
React Frontend (React 19, shadcn/ui, Tailwind CSS)
        ↓
Axios HTTP → FastAPI Backend (Python)
                    ↓
            AI Service (Emergent LLM → OpenAI GPT-4o)
                    ↓
            MongoDB (Motor async driver)

Admin Dashboard → Admin API Routes → MongoDB Aggregations
```

---

## Directory Structure

```
umitunker/
├── backend/
│   ├── server.py          # FastAPI app entry point, CORS, routers
│   ├── models.py          # Pydantic models (SearchRequest, SearchResponse, SearchHistory)
│   ├── ai_service.py      # AIService class: LLM integration, Turkish detection, JSON parsing
│   ├── admin_routes.py    # Admin API endpoints
│   ├── admin_service.py   # Analytics: stats, trends, popular queries, language distribution
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js                # React Router setup
│   │   ├── index.js              # React DOM render
│   │   ├── pages/
│   │   │   ├── HomePage.js       # Main search interface
│   │   │   └── AdminDashboard.js # Analytics dashboard
│   │   ├── components/ui/        # 47 shadcn/ui components
│   │   ├── services/
│   │   │   └── api.js            # Axios HTTP client (API base URL config)
│   │   ├── hooks/
│   │   │   └── use-toast.js      # Toast notifications hook
│   │   └── lib/
│   │       └── utils.js          # cn() utility (clsx + tailwind-merge)
│   ├── public/
│   │   ├── index.html
│   │   └── _redirects            # Netlify/SPA redirect rules
│   ├── package.json
│   ├── tailwind.config.js        # Custom theme configuration
│   ├── craco.config.js           # CRA + webpack alias override
│   ├── jsconfig.json             # Path alias: @/* → src/*
│   └── components.json           # shadcn/ui configuration
├── tests/
│   └── __init__.py               # Empty placeholder
├── backend_test.py               # Async integration tests (348 lines, aiohttp)
├── test_result.md                # YAML-based test tracking/agent communication
├── contracts.md                  # API contract specifications
├── .emergent.yml                 # Emergent platform deployment config
└── README.md
```

---

## Backend

### Technology Stack

| Dependency | Version | Purpose |
|---|---|---|
| fastapi | 0.110.1 | Web framework |
| uvicorn | 0.25.0 | ASGI server |
| motor | 3.3.1 | Async MongoDB driver |
| emergentintegrations | 0.1.0 | LLM abstraction |
| pydantic | 2.11.9 | Data validation |
| python-dotenv | 1.1.1 | Environment config |

### API Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/search` | AI-powered sales term search |
| `GET` | `/api/search/recent/{session_id}` | Recent searches for a session |
| `GET` | `/api/search/popular` | Most popular search terms |
| `GET/POST/DELETE` | `/api/admin/*` | Admin analytics and data management |

### Environment Variables

```
MONGO_URL           # MongoDB connection string
DB_NAME             # MongoDB database name
EMERGENT_LLM_KEY    # API key for Emergent LLM (OpenAI GPT-4o)
```

### AI Service Behavior

- Detects whether query is in Turkish or English
- Responds as a Turkish sales expert (system prompt in Turkish)
- Returns structured JSON with: `term`, `definition`, `usage_examples`, `related_terms`
- Model: `gpt-4o` via Emergent integrations LLM

### Data Model

```python
# SearchRequest
query: str
session_id: str

# SearchResponse
query: str
response: str       # AI-generated answer
timestamp: datetime
session_id: str

# SearchHistory (MongoDB document)
query, response, session_id, timestamp, language
```

---

## Frontend

### Technology Stack

| Package | Version | Purpose |
|---|---|---|
| react | 19.0.0 | UI framework |
| react-router-dom | 7.5.1 | Client-side routing |
| axios | 1.8.4 | HTTP client |
| tailwindcss | 3.4.17 | Utility-first CSS |
| @radix-ui/* | various | Accessible primitives |
| lucide-react | latest | Icon library |
| react-hook-form | 7.56.2 | Form handling |

### Path Aliases

```js
// Use @/ to import from src/ root
import { Button } from "@/components/ui/button"
import api from "@/services/api"
import { cn } from "@/lib/utils"
```

### Component Conventions

- All UI components live in `src/components/ui/` — these are shadcn/ui generated files, do not hand-edit unless necessary
- Pages are in `src/pages/`
- Use `cn()` from `@/lib/utils` for conditional class merging (combines `clsx` and `tailwind-merge`)
- Use `useToast` hook from `@/hooks/use-toast` for notifications
- Icons: import from `lucide-react`

### API Service

All backend calls go through `src/services/api.js`. The base URL is configured there. When adding new API calls, add them to this module rather than calling axios directly in components.

### Build Commands

```bash
# Development
yarn start

# Production build
yarn build

# Tests
yarn test
```

Package manager is **Yarn 1.22.22** (pinned). Do not use npm.

---

## Testing

### Backend Integration Tests

`backend_test.py` is the primary test file — it's an async test suite using `aiohttp` and `pytest`.

```bash
# Run backend tests
pytest backend_test.py -v
```

Tests cover:
- Health check endpoint
- Search endpoint (Turkish, English, mixed queries)
- Recent searches retrieval by session_id
- Popular searches endpoint
- Error handling and validation
- MongoDB storage verification

### Test Communication Protocol

`test_result.md` uses a YAML-based format for tracking test results and agent-to-agent communication. Update this file when running tests in automated contexts.

---

## Deployment

Configured via `.emergent.yml`:

```yaml
frontend:
  build_command: yarn build
  framework: react

backend:
  main: server.py
  framework: fastapi

routing:
  base_path: /uuai

domain: umitunker.com
```

---

## API Contracts

See `contracts.md` for the full specification including:
- Request/response shapes for all endpoints
- Database model definitions
- System prompt specification for the AI (Turkish sales expert persona)
- OpenAI model selection (gpt-4o)

---

## Key Conventions

1. **Language:** UI and AI responses are bilingual (Turkish primary, English supported). System prompts and AI persona are in Turkish.
2. **Async:** Backend uses async/await throughout (Motor for DB, async route handlers).
3. **No frontend TypeScript:** Despite TypeScript being in package.json, source files use `.js` / JSX. Do not rename to `.tsx`.
4. **shadcn/ui components:** Do not modify generated UI components in `components/ui/` unless fixing bugs. Add new components via shadcn CLI or by copying the pattern.
5. **Error handling:** Return structured JSON errors from FastAPI. Frontend handles errors via try/catch in the API service layer.
6. **MongoDB:** All DB operations use the Motor async driver. Collection name for search history is `search_history`.
7. **Session tracking:** A `session_id` (UUID) is generated client-side and sent with every search to group a user's history.

---

## Development Workflow

1. Backend changes: edit files in `backend/`, restart uvicorn
2. Frontend changes: `yarn start` for hot-reload dev server
3. Run `backend_test.py` after any backend changes to verify endpoints
4. Check `contracts.md` before modifying API shapes — keep frontend/backend in sync
5. Commit with descriptive messages; the branch for active development is tracked in `.emergent/`
