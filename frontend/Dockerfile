# Image de base Node 20 LTS
FROM node:20-alpine

# Variables d'environnement
ENV NODE_ENV=development

# Installation des dépendances système
RUN apk add --no-cache \
    git \
    curl

# Création de l'utilisateur non-root
RUN adduser -D -u 1001 fareuser && \
    mkdir -p /app && \
    chown -R fareuser:fareuser /app

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./

# Installation des dépendances (en tant que root)
RUN npm install && \
    chown -R fareuser:fareuser /app

# Copier le code de l'application
COPY --chown=fareuser:fareuser . .

# Changer vers l'utilisateur non-root
USER fareuser

# Port exposé
EXPOSE 5173

# Commande de démarrage
CMD ["npm", "run", "dev"]