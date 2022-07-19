FROM node:alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY scythe/package.json /app/
COPY scythe/yarn.lock /app/
RUN yarn install --silent
COPY . /app
RUN yarn build

FROM nginx:1.17.8-alpine
COPY --from=build /app/out /usr/share/nginx/html
COPY config/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]