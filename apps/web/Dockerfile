# Static viewer + data-entry screens. Vanilla HTML/JS, no build, no dependencies.
FROM nginx:alpine
# Top-level pages (live view, command board, module index, login, hydrant) …
COPY apps/web/*.html /usr/share/nginx/html/
# … and the 42 generated NERIS module screens.
COPY apps/web/modules/ /usr/share/nginx/html/modules/
EXPOSE 80
