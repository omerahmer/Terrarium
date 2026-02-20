# Terrarium

> Visual multi-cloud infrastructure designer with AI-powered Terraform generation and architecture validation

[![Go](https://img.shields.io/badge/Go-1.23+-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## What is Terrarium?

Terrarium is a visual infrastructure design tool that lets you drag and drop cloud resources onto a canvas, connect them together, and instantly generate production-ready Terraform code. It combines an intuitive graphical interface with AI agents that validate your architecture and fix common mistakes automatically.

Think Figma or Lucidchart, but the output is working infrastructure-as-code instead of just a diagram.

---

## Core Features

###  Visual Architecture Designer
- Drag AWS resources (EC2, RDS, S3, Lambda, VPC, etc.) from a sidebar onto an infinite canvas
- Draw connections between resources to model data flow and dependencies
- Click any resource to configure its properties (instance types, CIDR blocks, bucket names, etc.)
- VPCs and subnets render as containers that visually group resources
- Save and load architecture diagrams as JSON

###  AI-Powered Terraform Generation
- Converts your visual architecture into valid Terraform HCL code in real-time
- Uses Claude (Anthropic) to intelligently generate resource blocks with proper references
- Automatically resolves dependencies between resources (e.g., `vpc_id = aws_vpc.main.id`)
- Extracts variables and generates `variables.tf` and `outputs.tf` files
- **Validation Agent** runs `terraform validate` in a loop, sends errors back to the LLM, and self-corrects until the code is syntactically valid

###  Architecture Review Agent
- Click "Review Architecture" to get AI-powered feedback on your design
- **Deterministic checks** catch common mistakes:
  - EC2 instances with no Auto Scaling Group (single point of failure)
  - Databases exposed without Security Groups
  - Lambda functions directly calling RDS (connection pool exhaustion)
  - S3 buckets with no public access block
  - RDS instances with no backup retention configured
- **LLM holistic review** identifies patterns and anti-patterns the deterministic checks miss
- Returns structured findings with severity levels (error/warning/info) and suggested fixes

###  Multi-File Terraform Output
- `main.tf` — resource definitions
- `variables.tf` — extracted configuration variables
- `outputs.tf` — useful outputs (IDs, endpoints, etc.)
- Downloadable as a ZIP or copyable from an in-app Monaco editor (VS Code's editor component)

### 🌍 Multi-Cloud Ready (Roadmap)
- AWS support ships first (Phase 1)
- Azure and GCP support coming in later phases
- Design is cloud-agnostic — adding new providers means updating the resource library and Terraform templates

---

## How It Works

```
┌─────────────────┐
│  React Canvas   │  User drags resources, draws connections, sets properties
└────────┬────────┘
         │ Canvas JSON (nodes + edges + properties)
         ▼
┌─────────────────┐
│   Go API        │  HTTP router, request validation, proxies to AI service
└────────┬────────┘
         │ Forwards canvas JSON
         ▼
┌─────────────────┐
│  Python AI      │  LangGraph agents orchestrate generation and validation
│  (LangGraph)    │
└────────┬────────┘
         │
         ├──▶ Claude API ───▶ Generate Terraform HCL
         │
         ├──▶ terraform validate ───▶ Check syntax/schema
         │          │
         │          └─▶ If errors, loop back to Claude with fixes
         │
         └──▶ Architecture review agent ───▶ Return findings
```

---

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **React Flow** — canvas engine for nodes and edges
- **Zustand** — lightweight state management
- **Monaco Editor** — VS Code editor for live Terraform preview
- **Tailwind CSS** — utility-first styling
- **Vite** — build tool

### Backend
- **Go** (Chi router) — fast HTTP API layer
- **Python** (FastAPI) — AI orchestration service
- **LangGraph** — agentic workflow framework
- **Anthropic SDK** — Claude AI integration
- **Pydantic v2** — data validation

### Infrastructure
- **Docker + Docker Compose** — local development environment
- **Terraform CLI** — embedded in Python container for validation
- **Vercel** — frontend deployment (planned)
- **Railway/Render** — backend deployment (planned)

---

## Project Status

**Current Phase:** Week 2 — Building custom AWS nodes and property panels

**Completed:**
- ✅ Docker Compose orchestration (frontend + Go + Python)
- ✅ React Flow canvas with draggable nodes and edges
- ✅ Custom AWS resource node components
- ✅ Basic node styling and connection handles

**In Progress:**
- 🚧 Sidebar with 10 AWS resource types
- 🚧 Drag-from-sidebar to canvas
- 🚧 Property panel for configuring resources

**Upcoming (Week 3-7):**
- Canvas JSON serialization
- Claude integration for Terraform generation
- LangGraph validation agent (generate → validate → fix loop)
- LangGraph architecture review agent
- Monaco editor code preview panel
- Save/load architecture diagrams
- Pre-built architecture templates

---

## Getting Started

### Prerequisites
- Docker Desktop
- Go 1.23+
- Python 3.12+
- Node.js 20+
- uv (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/terrarium.git
   cd terrarium
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

3. **Run with Docker Compose**
   ```bash
   docker compose up --build
   ```

4. **Access the app**
   - Frontend: http://localhost:5173
   - Go API: http://localhost:8080
   - Python AI service: http://localhost:8000

### Local Development (without Docker)

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Go API:**
```bash
cd api
go mod download
go run main.go
```

**Python AI:**
```bash
cd ai
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Roadmap

### Phase 1: AWS Foundation (Weeks 1-7)
- Visual canvas with 20 core AWS resource types
- Terraform generation with validation loop
- Architecture review agent
- Save/load diagrams
- Pre-built templates (3-tier web app, serverless API, data pipeline)

### Phase 2: Production Readiness (Weeks 8-10)
- User authentication and project storage
- Multi-file Terraform output (main.tf, variables.tf, outputs.tf)
- Export diagrams as PNG/SVG/PDF
- Cost estimation via AWS Pricing API
- Deployment to Vercel + Railway

### Phase 3: Advanced Features (Weeks 11-14)
- Azure resource support
- GCP resource support
- CloudFormation export (alternative to Terraform)
- Multi-region architecture support
- Real-time collaboration (WebSocket-based)

### Phase 4: Enterprise (Future)
- Team workspaces and sharing
- Version control integration (Git)
- CI/CD pipeline generation
- Terraform state management
- Optional sandboxed `terraform apply` with user-provided credentials

---

## Why This Project Matters

Infrastructure-as-code is powerful but has a steep learning curve. Most developers learn Terraform by:
1. Reading documentation
2. Copy-pasting examples
3. Running `terraform apply`
4. Breaking things
5. Debugging cryptic error messages

Terrarium inverts this. You design visually (which humans are good at), get instant feedback (via AI validation), and learn Terraform by seeing what your diagram generates. It's a teaching tool as much as a productivity tool.

For experienced practitioners, it's a faster way to scaffold new architectures, catch mistakes before they hit production, and generate boilerplate that would take 30+ minutes to write by hand.

---

## Contributing

This is currently a solo portfolio project, but contributions are welcome once the core features ship. Areas where help would be valuable:
- Additional AWS resource types beyond the initial 20
- Azure and GCP resource definitions
- UI/UX improvements and design system work
- Documentation and tutorials
- Bug reports and feature requests

---

## License

MIT License — see LICENSE file for details

---

## Acknowledgments

- **React Flow** for the excellent graph visualization library
- **Anthropic** for Claude and the AI capabilities that make this possible
- **HashiCorp** for Terraform
- **AWS** for publishing their architecture icons under a permissive license

---

**Built by a junior developer learning Go, Python agentic patterns, and cloud infrastructure — feedback and suggestions welcome.**
