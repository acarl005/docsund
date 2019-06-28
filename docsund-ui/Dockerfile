FROM node:12-alpine

COPY . /app
WORKDIR /app
RUN npm install

EXPOSE 1234

ENTRYPOINT ["/bin/sh", "-c"]
CMD ["npm run build && npm start"]
