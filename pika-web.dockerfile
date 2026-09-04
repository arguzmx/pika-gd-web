FROM nginx:latest
RUN rm -rf /usr/share/nginx/html/*
COPY ./dist /usr/share/nginx/html
COPY ./docker/default.conf /etc/nginx/nginx.conf