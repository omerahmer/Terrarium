# Using Node 20 Alpine — Alpine is a minimal Linux distro, keeps image size small
FROM node:20-alpine

WORKDIR /app

# Copy package files first, install dependencies, THEN copy source.
# Docker caches each line as a layer. If you copy source first,
# any code change busts the cache and reinstalls node_modules every time.
# This order means node_modules only reinstalls when package.json changes.
COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5173

# --host 0.0.0.0 is required — without it Vite only listens on localhost
# inside the container, which is unreachable from your browser outside it
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]