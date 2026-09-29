FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY apps ./apps
COPY packages ./packages
COPY prisma ./prisma
COPY tsconfig.json ./

RUN npm ci
RUN npx prisma generate

RUN npm run build

CMD ["npm", "start"]
