# syntax=docker/dockerfile:1
# docker build --pull --rm -f "Dockerfile" -t oncharterliz/frigate-frontend:latest "."

FROM node:18-alpine AS frigate-frontend

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD [ "npm", "run", "dev" ]

EXPOSE 5173