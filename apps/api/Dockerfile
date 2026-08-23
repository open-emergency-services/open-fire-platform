# Wave-0 API image. Multi-stage: build then slim runtime.
FROM node:20-alpine AS build
WORKDIR /repo
COPY . .
RUN corepack enable && (pnpm install --frozen-lockfile || npm install)
# Generate the NERIS schema if the framework is reachable (otherwise the committed generated
# sources are used), then COMPILE the schema package to JS so the API can import its value
# sets (e.g. NERIS_CORE_FIELDS) at runtime — its `main` is dist/index.js.
RUN npm --prefix packages/neris-schema run generate || true
RUN npm --prefix packages/neris-schema run build
RUN npm --prefix apps/api run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/apps/api/package.json ./package.json
COPY --from=build /repo/apps/api/migrations ./migrations
COPY --from=build /repo/node_modules ./node_modules
# The workspace symlink node_modules/@ofp/neris-schema → ../packages/neris-schema must resolve
# at runtime, so ship the built schema package too.
COPY --from=build /repo/packages ./packages
EXPOSE 3000
CMD ["node", "dist/main.js"]
