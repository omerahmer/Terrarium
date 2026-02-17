# Python 3.12 slim — "slim" removes dev tools and docs, smaller than the full image
# but still Debian-based unlike Alpine, which matters because some Python packages
# (numpy, etc.) have binary wheels that don't compile cleanly on Alpine
FROM python:3.12-slim

WORKDIR /app

# curl is needed for the Docker healthcheck in docker-compose.yml
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Terraform CLI — needed by the validation agent to run terraform validate.
# We pull the official HashiCorp release directly.
# If you're on ARM (M1/M2 Mac), the amd64 below still works via Docker's emulation,
# but you can swap to arm64 if you want native performance.
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    unzip \
    && wget -q https://releases.hashicorp.com/terraform/1.10.5/terraform_1.10.5_linux_amd64.zip \
    && unzip terraform_1.10.5_linux_amd64.zip \
    && mv terraform /usr/local/bin/ \
    && rm terraform_1.10.5_linux_amd64.zip \
    && rm -rf /var/lib/apt/lists/*

# Same layer-caching pattern — requirements first, then source
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# --host 0.0.0.0 makes FastAPI reachable from other containers, not just localhost
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]