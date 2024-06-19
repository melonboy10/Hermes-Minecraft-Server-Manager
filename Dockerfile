### DOCKER ###

# Dockerfile
FROM docker:24.0.6-alpine3.18
WORKDIR /app
RUN apk add --no-cache bash
SHELL [ "/bin/bash", "-c" ]

### NODE SETUP
RUN apk add --no-cache nodejs npm

### WEBSITE SETUP
RUN npm install -g pnpm
COPY package.json ./
RUN pnpm install

# Copy all files except the ones in .dockerignore
COPY . .
RUN pnpm run build
EXPOSE 3000

### DATABASE SETUP
ARG PB_VERSION=0.22.8
RUN apk add --no-cache ca-certificates

ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d ./database/
EXPOSE 8090

### RUN BOTH
CMD if [ -n "$POCKETBASE_INTERNAL_ADMIN_EMAIL" ] && [ -n "$POCKETBASE_INTERNAL_ADMIN_PASSWORD" ]; then \
  ./database/pocketbase serve --http=0.0.0.0:8090; \
  else \
  echo "PocketBase admin credentials not set. Skipping database startup."; \
  fi & \
  (sleep 5; ORIGIN=https://$PUBLIC_ROOT_DOMAIN node build)

### NODE ###

# # Dockerfile
# FROM node:20-alpine3.17
# WORKDIR /app
# RUN apk add --no-cache bash
# SHELL [ "/bin/bash", "-c" ]

# RUN npm install -g pnpm
# COPY package.json ./
# RUN pnpm install

# # Copy all files except the ones in .dockerignore
# COPY . .
# RUN pnpm run build

# # Website internal port
# EXPOSE 3000

# ### DATABASE SETUP

# ARG PB_VERSION=0.18.3
# RUN apk add --no-cache unzip ca-certificates

# # download and unzip PocketBase
# ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
# RUN unzip /tmp/pb.zip -d ./database/

# # Database internal port
# EXPOSE 8090

# ### DOCKER COMPOSE SETUP
# # RUN http://ftp.halifax.rwth-aachen.de/alpine/v3.16/main >> /etc/apk/repositories; \
# #   http://ftp.halifax.rwth-aachen.de/alpine/v3.16/community >> /etc/apk/repositories; \
# #   apk update; \
# #   apk add --no-cache docker docker-compose-plugin

# # Run both the website and the database
# CMD ORIGIN=https://$PUBLIC_ROOT_DOMAIN node build & \
#   if [ -n "$POCKETBASE_INTERNAL_ADMIN_EMAIL" ] && [ -n "$POCKETBASE_INTERNAL_ADMIN_PASSWORD" ]; then \
#   ./database/pocketbase serve --http=0.0.0.0:8090; \
#   else \
#   echo "PocketBase admin credentials not set. Skipping database startup."; \
#   fi

### BUN ###

# # Dockerfile
# FROM oven/bun
# WORKDIR /app
# SHELL [ "/bin/bash", "-c" ]

# ### WEBSITE SETUP
# COPY package.json ./
# RUN bun install

# # Copy all files except the ones in .dockerignore
# COPY . .
# RUN bun run build

# # Website internal port
# EXPOSE 3000

# # RUN rm -rf node_modules
# # RUN bun install --production

# ### DATABASE SETUP

# ARG PB_VERSION=0.18.3

# RUN apt-get update && apt-get install -y unzip ca-certificates

# # download and unzip PocketBase
# ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
# RUN unzip /tmp/pb.zip -d ./database/

# # Database internal port
# EXPOSE 8090

# ### DOCKER COMPOSE SETUP

# ADD https://get.docker.com/ /tmp/get-docker.sh
# RUN chmod +x /tmp/get-docker.sh
# RUN /tmp/get-docker.sh
# # Disable docker systemctl
# RUN systemctl mask docker

# # Run both the website and the database
# CMD ORIGIN=https://$PUBLIC_ROOT_DOMAIN bun run ./build/index.js & \
#   if [ -n "$POCKETBASE_INTERNAL_ADMIN_EMAIL" ] && [ -n "$POCKETBASE_INTERNAL_ADMIN_PASSWORD" ]; then \
#   ORIGIN=https://$PUBLIC_ROOT_DOMAIN ./database/pocketbase serve --http=0.0.0.0:8090; \
#   else \
#   echo "PocketBase admin credentials not set. Skipping database startup."; \
#   fi