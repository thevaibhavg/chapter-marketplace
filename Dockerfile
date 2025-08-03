# Stage 1: install dependencies (only production deps here for speed)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: build (needs dev deps for Tailwind/Vite)
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
# Install everything needed for build
RUN npm ci
ENV NODE_ENV=production
RUN npm run build

# Stage 3: serve static output with nginx
FROM nginx:stable-alpine AS release
# Clear default content
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
