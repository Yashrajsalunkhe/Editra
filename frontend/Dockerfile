FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

# Copy the nginx config template (contains ${BACKEND_URL})
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# BACKEND_URL is resolved by nginx's envsubst mechanism at startup.
# nginx:1.20+ docker images auto-process /etc/nginx/templates/*.template
# and write the result to /etc/nginx/conf.d/ before starting.
#
# Default points to Render backend URL for image-only deployments.
# docker-compose overrides this via environment for local networking.
ENV BACKEND_URL=https://editra-backend.onrender.com

# CRITICAL: Only substitute BACKEND_URL — without this filter,
# envsubst would replace nginx's own $host, $remote_addr, etc.
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL

CMD ["nginx", "-g", "daemon off;"]
