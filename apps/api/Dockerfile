# Open Fire Platform — API image. Multi-stage: a full workspace build, then a
# slim runtime that ships a self-contained pnpm `deploy` bundle.
#
# Why the bundle (D11): this repo installs with pnpm's default *isolated* node
# linker, so each package's dependencies live in that package's own
# node_modules (symlinked into a shared `.pnpm` store) — NOT in the repo-root
# node_modules. An earlier runtime stage that copied only the root node_modules
# therefore could not resolve `@nestjs/core` at boot (MODULE_NOT_FOUND); the
# image built fine but crashed on start, and CI only built it. `pnpm deploy`
# produces a directory whose node_modules is self-contained and portable
# (workspace deps injected, symlinks kept internal), which is exactly what a
# container runtime needs. We build that in the build stage and copy it whole.
FROM node:20-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY . .
# Install the whole workspace exactly as locked. No `npm install` fallback:
# npm cannot parse the `workspace:*` protocol this repo uses, so the fallback
# could only ever produce a broken tree — fail loudly instead.
RUN pnpm install --frozen-lockfile
# Generate the NERIS schema if the upstream framework is reachable; otherwise
# fall back to the committed generated sources. Then compile the schema to JS
# (its `main` is dist/index.js) and build the API. Both must be built BEFORE
# the deploy step, which packs files as-is and does not run these builds.
RUN pnpm --filter @ofp/neris-schema run generate || true
RUN pnpm --filter @ofp/neris-schema run build
RUN pnpm --filter @ofp/api run build
# Produce the self-contained production bundle at /bundle: prod deps only,
# workspace deps injected, a portable node_modules. Target is outside /repo so
# pnpm treats it as a clean deploy destination.
RUN pnpm --filter @ofp/api deploy --prod /bundle

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
# Everything the runtime needs — dist, migrations, package.json, and the
# self-contained node_modules — comes from the deploy bundle.
COPY --from=build /bundle ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
