# build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# build TypeScript → dist
RUN npm run build


# production stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# copy built files only (not source)
COPY --from=builder /app/dist ./dist

# expose port (important for clarity)
EXPOSE 4000

# start server
CMD ["node", "dist/index.js"]