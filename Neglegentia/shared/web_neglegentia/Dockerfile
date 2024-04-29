FROM node:21-alpine

WORKDIR /app

COPY src/ .

RUN npm i

EXPOSE 1337

CMD ["npm", "run", "start"]
