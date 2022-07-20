FROM node:alpine as dependencies
WORKDIR /app
COPY scythe/package.json scythe/yarn.lock ./
RUN yarn install --silent --frozen-lockfile

FROM node:alpine as builder
WORKDIR /app
COPY scythe/ ./
COPY --from=dependencies /app/node_modules ./node_modules
RUN yarn build && yarn export

FROM nginx:1.17.8-alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY scythe/config/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]