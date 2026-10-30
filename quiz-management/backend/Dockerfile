FROM node:26-slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN sed -i 's/\r$//' docker-entrypoint.sh
RUN npx prisma generate
ENV NODE_ENV=production
EXPOSE 4000
CMD ["sh", "docker-entrypoint.sh"]
