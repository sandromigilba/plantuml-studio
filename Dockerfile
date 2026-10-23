# Multi-stage Dockerfile untuk Nuxt 3/4 PlantUML Studio
FROM node:22-alpine AS builder

WORKDIR /app

# Salin manifest dependensi
COPY package.json package-lock.json ./

# Instal dependensi untuk build
RUN npm ci

# Salin seluruh kode sumber proyek
COPY . .

# Build aplikasi Nuxt untuk produksi
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Runtime image yang ringan
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Salin output hasil build dari stage builder
COPY --from=builder /app/.output ./.output

EXPOSE 3000

# Jalankan server Nitro
CMD ["node", ".output/server/index.mjs"]
