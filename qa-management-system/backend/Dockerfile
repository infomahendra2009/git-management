FROM node:20-slim
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=4000
EXPOSE 4000

# server.js retries the MySQL connection on its own (initSchema), so no separate
# "wait for db" step is needed — it just needs the mysql service to exist eventually.
CMD ["sh", "-c", "node seed.js --if-empty && node server.js"]
