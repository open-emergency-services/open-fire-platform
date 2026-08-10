# Wave-0 API image. Multi-stage: build then slim runtime.
FROM node:20-alpine AS build
WORKDIR /repo
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile || npm install
RUN npm --prefix packages/neris-schema run generate || true
RUN npm --prefix apps/api run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/apps/api/package.json ./
COPY --from=build /repo/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
