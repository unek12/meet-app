FROM node

WORKDIR /app

COPY . .

WORKDIR /app/client
RUN npm i --force
RUN npm run build

WORKDIR /app
RUN npm i

ENV PORT=5000

EXPOSE 5000

CMD [ "npm", "run", "start" ]
