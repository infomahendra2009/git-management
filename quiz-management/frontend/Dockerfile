FROM node:26-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache openssl
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker-entrypoint-https.sh /usr/local/bin/docker-entrypoint-https.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint-https.sh && chmod +x /usr/local/bin/docker-entrypoint-https.sh
EXPOSE 80 443
CMD ["/usr/local/bin/docker-entrypoint-https.sh"]
