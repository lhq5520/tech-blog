# Build React app
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Serve static files
FROM node:18
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/build ./build
CMD ["serve", "-s", "build", "-l", "3000"]
