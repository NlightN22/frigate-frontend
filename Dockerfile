# syntax=docker/dockerfile:1

FROM nginx:latest AS frigate-frontend

WORKDIR /
# COPY web/package.json web/package-lock.json ./
# RUN npm install

COPY ./dist/ /usr/share/nginx/html/

RUN service nginx restart

# RUN npm run build 
#     && mv dist/BASE_PATH/monacoeditorwork/* dist/assets/ \
#     && rm -rf dist/BASE_PATH

EXPOSE 80