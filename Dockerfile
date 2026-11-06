# Build: Astro renders the site to static HTML/CSS in dist/.
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build && npm test

# Run: Chainguard node (distroless, non-root). Only dist/ + a zero-dependency server, no node_modules.
FROM cgr.dev/chainguard/node:latest AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/serve.mjs ./serve.mjs
ENV NODE_ENV=production
EXPOSE 3000
# Chainguard's entrypoint is /usr/bin/node, so CMD is just the script.
CMD ["/app/serve.mjs"]
