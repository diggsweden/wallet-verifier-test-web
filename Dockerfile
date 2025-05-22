FROM nginxinc/nginx-unprivileged:stable-alpine

USER root
COPY .output/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

USER nginx
EXPOSE 80
