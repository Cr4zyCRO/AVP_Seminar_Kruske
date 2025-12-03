# koristi node verziju 20
FROM node:20

# ude u backend
WORKDIR /backend

#kopira package.json i packege-lock.json
COPY package*.json ./

#instalira dependencije iz tih package-a
RUN npm install

#kopira ostatak koda u kontejner
COPY . .

# postavi port env var
ENV PORT=5000

# kaze dockeru da koristi ovi port
EXPOSE 5000

# pokrece server (CMD - starta kontejner, RUN - builda image)
CMD ["npm", "start"]