# ── Stage 1: Build ────────────────────────────────────────────────────────────
# This stage compiles the Go binary. We use the full Go image for this
# because we need the compiler toolchain.
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Same layer-caching trick as the frontend Dockerfile —
# copy go.mod and go.sum first, download dependencies,
# then copy source. Dependency downloads only re-run when go.mod changes.
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build a statically linked binary.
# CGO_ENABLED=0 disables C bindings so the binary has zero external dependencies.
# -ldflags="-w -s" strips debug info to reduce binary size.
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o bin/api .

# ── Stage 2: Run ──────────────────────────────────────────────────────────────
# We throw away the entire Go toolchain and copy only the compiled binary
# into a minimal image. The final image is ~10MB instead of ~300MB.
FROM alpine:3.20

# ca-certificates is needed for making HTTPS calls (Go → Claude API via Python)
RUN apk --no-cache add ca-certificates curl

WORKDIR /app

COPY --from=builder /app/bin/api .

EXPOSE 8080

CMD ["./api"]