# --- Build stage ---
FROM node:18-alpine AS build
WORKDIR /app

# Copia i file principali e installa le dipendenze
COPY package*.json ./
RUN npm ci

# Copia tutto il codice dell'app
COPY . .

# Costruisci l'app Next.js in modalità standalone
RUN npm run build

# --- Runtime stage ---
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copia i file necessari dal build stage
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]
