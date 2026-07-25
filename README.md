# Terrarium

> Visual AWS infrastructure designer with AI-powered Terraform generation and architecture validation

[![Go](https://img.shields.io/badge/Go-1.23+-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## What is Terrarium?

Terrarium is a visual infrastructure design tool that lets you drag and drop AWS resources onto a canvas, connect them together, and generate production-ready Terraform code. A LangGraph-backed AI service turns your diagram into `main.tf`, `variables.tf`, and `outputs.tf`, runs `terraform validate` in a self-correction loop, and reviews your architecture for security and reliability issues.

Think Figma or Lucidchart, but the output is working infrastructure-as-code instead of just a diagram.

---

## Core Features

### Visual Architecture Designer

- **27 AWS resource types** — VPC, Subnet, EC2, RDS, S3, Lambda, ALB/NLB/ELB, API Gateway, DynamoDB, ECS, IAM, and more, each with official AWS icons
- **Drag-and-drop canvas** powered by React Flow — pan, zoom, animated edges, and a collapsible resource sidebar grouped by category
- **Schema-driven property panel** — configure instance types, CIDR blocks, engine versions, and other resource-specific settings; pick related resources (subnets, security groups) directly from the canvas
- **Validated connections** — relationship rules enforce allowed edges between resource types (e.g. ALB → EC2) and label them automatically
- **VPC containers** — VPCs render as resizable dashed containers; dropping a resource inside a VPC nests it as a child node
- **Pre-built templates** — start from a 3-tier web app, serverless API, or event-driven data pipeline
- **Save and load** — diagrams persist to `localStorage`; signed-in users can save projects to the cloud via Supabase
- **Live cost estimate** — a monthly cost breakdown updates as you configure resources, based on a bundled AWS pricing snapshot

### AI-Powered Terraform Generation

- Click **Generate Terraform** to send the full canvas (nodes, edges, and per-resource config) to the backend
- **Claude** (`claude-sonnet-4-6`) reads the diagram and emits three files via a forced tool call: `main.tf`, `variables.tf`, and `outputs.tf`
- Resolves dependencies from `parentId` (containment) and edges into real Terraform references — no hardcoded IDs
- **LangGraph validation loop** — after generation, `terraform init` + `terraform validate` run in a temp workspace; validation errors are fed back to Claude for up to **3 attempts**
- **Monaco editor preview** — tabbed, syntax-highlighted HCL editor (lazy-loaded); edit generated code in-panel before export
- **ZIP download** — export all three `.tf` files as `terraform.zip`

### Architecture Review Agent

- Click **Review Architecture** for automated feedback on your design
- **Deterministic checks** (rule-based, no LLM required):
  - EC2 instances with no load balancer in front (single point of failure)
  - RDS / ElastiCache databases without a security group
  - Lambda functions with a direct edge to RDS (connection pool exhaustion)
  - S3 buckets without public access blocked
  - RDS instances running single-AZ
- **LLM holistic review** — Claude analyzes cross-resource patterns (security exposure, availability, scalability, observability, cost) that rule checks miss; deterministic findings are not duplicated
- **Structured findings** with severity (`error` / `warning` / `info`), remediation suggestions, and canvas node highlighting on click

### Multi-File Terraform Output

| File | Contents |
|------|----------|
| `main.tf` | Provider block, resource definitions, inter-resource references |
| `variables.tf` | Extracted configuration with sensible defaults |
| `outputs.tf` | Resource IDs, ARNs, endpoints |

Copy individual files from the Monaco panel or download the full set as a ZIP.

### Accounts & Cloud Projects (optional)

- Sign in with Supabase (email or OAuth) to save diagrams as named projects in the cloud
- Without Supabase credentials the app runs fully offline with `localStorage` only
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env.local`

### Multi-Cloud (Roadmap)

- AWS support ships first
- Azure and GCP planned for later phases
- The resource schema and canvas model are designed to be provider-agnostic

---

## How It Works

```
┌─────────────────────┐
│  React Canvas       │  Drag resources, draw connections, configure properties
└──────────┬──────────┘
           │  Canvas JSON (nodes + edges + config)
           ▼
┌─────────────────────┐
│  Go API (Chi)       │  CORS, health checks, proxies /generate and /review
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Python AI          │  FastAPI + LangGraph agents
│  (FastAPI)          │
└──────────┬──────────┘
           │
           ├──▶ Generation graph
           │      generate (Claude) → terraform validate → fix (Claude) ↺
           │      returns main.tf, variables.tf, outputs.tf
           │
           └──▶ Review agent
                  deterministic checks → LLM review (Claude)
                  returns structured findings
```

---

## Tech Stack

### Frontend

| Technology | Role |
|------------|------|
| React 19 + TypeScript | UI framework |
| React Flow (`@xyflow/react`) | Canvas engine |
| Monaco Editor | Live Terraform HCL preview |
| Tailwind CSS + shadcn/ui | Styling and components |
| Supabase JS | Optional auth and cloud project storage |
| JSZip | Terraform ZIP export |
| Vite | Build tool |

### Backend

| Technology | Role |
|------------|------|
| Go (Chi router) | HTTP API gateway, CORS, AI service proxy |
| Python (FastAPI) | AI orchestration endpoints |
| LangGraph | Generation graph (generate → validate → fix loop) |
| Anthropic SDK | Claude for HCL generation and architecture review |
| Pydantic v2 | Request/response validation |
| Terraform CLI | Embedded in the AI container for `terraform validate` |

### Infrastructure

- **Docker Compose** — local development (frontend, Go API, Python AI)
- **Terraform CLI 1.10** — baked into the AI Docker image
- **Railway / Vercel** — production deployment targets (`PORT`, `ALLOWED_ORIGINS`, `VITE_API_URL`)

---

## Project Structure

```
Terrarium/
├── frontend/               # React app
│   └── src/
│       ├── pages/          # Landing, Canvas, Login, Account
│       ├── components/     # AWSNode, PropertyPanel, TerraformOutput, ReviewPanel, …
│       └── lib/
│           ├── aws-schema.ts       # Resource definitions, properties, allowed targets
│           ├── relationship-rules.ts
│           ├── canvas-storage.ts   # localStorage persistence
│           ├── templates.ts        # Pre-built architecture templates
│           ├── pricing.ts          # Client-side cost estimation
│           └── projects.ts         # Supabase cloud project CRUD
├── api/                    # Go Chi HTTP gateway
│   └── main.go             # /health, /generate, /review proxies
├── ai/                     # Python AI service
│   ├── main.py             # FastAPI entrypoint
│   ├── terraform_graph.py  # LangGraph generation + validation loop
│   ├── review.py           # Deterministic checks + LLM review
│   ├── llm.py              # Shared Anthropic client
│   └── models.py           # Pydantic request/response models
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- Docker Desktop (recommended), or Go 1.23+, Python 3.12+, Node.js 20+
- An [Anthropic API key](https://console.anthropic.com/) (required for Generate and Review)
- Optional: a [Supabase](https://supabase.com/) project for cloud auth and project storage

### Quick start (Docker)

1. **Clone and configure**
   ```bash
   git clone https://github.com/yourusername/terrarium.git
   cd terrarium
   cp .env.example .env
   # Add your ANTHROPIC_API_KEY to .env
   ```

2. **Run**
   ```bash
   docker compose up --build
   ```

3. **Open**
   - Frontend: http://localhost:5173
   - Go API: http://localhost:8080/health
   - Python AI: http://localhost:8000/health

4. **Optional — cloud projects**
   ```bash
   cp frontend/.env.example frontend/.env.local
   # Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```

### Local development (without Docker)

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:8080
npm run dev
```

**Go API:**
```bash
cd api
go mod download
AI_SERVICE_URL=http://localhost:8000 go run main.go
```

**Python AI:**
```bash
cd ai
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Environment variables

| Variable | Service | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | AI | Required for Terraform generation and architecture review |
| `AI_SERVICE_URL` | Go API | Python AI base URL (default `http://localhost:8000`) |
| `ALLOWED_ORIGINS` | Go API | Comma-separated CORS origins (default `http://localhost:5173`) |
| `PORT` | Go API | Listen port (default `8080`; set by Railway in production) |
| `VITE_API_URL` | Frontend | Go API base URL baked in at build time |
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL (optional) |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase anon key (optional) |

---

## API Endpoints

### Go API (`:8080`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check |
| `POST` | `/generate` | Proxy to AI — returns Terraform files + validation status |
| `POST` | `/review` | Proxy to AI — returns architecture findings |

### Python AI (`:8000`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check |
| `POST` | `/generate` | LangGraph generation loop → `{ files, validated, attempts, errors }` |
| `POST` | `/review` | Deterministic + LLM review → `{ findings }` |

Both `POST` endpoints accept the same canvas payload:

```json
{
  "nodes": [
    {
      "id": "vpc-1",
      "parentId": null,
      "data": {
        "label": "Main VPC",
        "resourceType": "aws-vpc",
        "config": { "cidrBlock": "10.0.0.0/16" }
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "alb-1",
      "target": "ec2-1",
      "data": { "relationship": "routes to" }
    }
  ]
}
```

---

## Roadmap

### Shipped

- Visual canvas with 27 AWS resource types and schema-driven properties
- Validated resource connections and VPC container nesting
- AI Terraform generation with LangGraph validation loop (up to 3 attempts)
- Multi-file output (`main.tf`, `variables.tf`, `outputs.tf`) with Monaco preview and ZIP export
- Architecture review agent (deterministic checks + LLM holistic review)
- Pre-built templates (3-tier web, serverless API, data pipeline)
- Local save/load and optional Supabase cloud projects
- Client-side monthly cost estimation

### Planned

- Subnet visual containers and stronger containment semantics
- Diagram export as PNG / SVG / PDF
- Live AWS Pricing API integration (replacing the bundled pricing snapshot)
- Azure and GCP resource libraries
- Multi-region architecture support
- Real-time collaboration (WebSocket)
- Team workspaces, Git integration, and CI/CD pipeline generation
- Optional sandboxed `terraform apply` with user-provided credentials

---

## License

Open source — bring your own Anthropic API key and self-host.
