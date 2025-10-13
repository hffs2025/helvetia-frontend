# --- FASE 1: BUILD ---
FROM node:18-alpine AS build

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file principali e installa le dipendenze
COPY package*.json ./
RUN npm ci

# Copia tutto il codice del progetto
COPY . .

# Costruisci l'app Next.js in modalità standalone
RUN npm run build

# --- FASE 2: RUNTIME ---
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copia i file necessari dal build stage
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next/static ./.next/static

# Espone la porta 3000 per ECS/ALB
EXPOSE 3000

# Avvia l'app Next.js (standalone)
CMD ["node", "server.js"]
