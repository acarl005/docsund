FROM node:12-alpine

COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build
RUN rm -rf node_modules
RUN npm install --production

EXPOSE 1234

ENTRYPOINT ["/bin/sh", "-c"]
CMD ["npm start"]
