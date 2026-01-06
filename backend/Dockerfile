# Image de base Python 3.11
FROM python:3.11-slim-bookworm

# Variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    DEBIAN_FRONTEND=noninteractive \
    TZ=Pacific/Tahiti

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    postgresql-client \
    libpq-dev \
    libxml2-dev \
    libxslt1-dev \
    tzdata \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Création de l'utilisateur non-root
RUN useradd -m -u 1000 fareuser && \
    mkdir -p /app/logs /app/templates /app/exports && \
    chown -R fareuser:fareuser /app

# Définir le répertoire de travail
WORKDIR /app

# Copier le fichier requirements
COPY --chown=fareuser:fareuser requirements.txt .

# Installation des dépendances Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY --chown=fareuser:fareuser ./app ./app
COPY --chown=fareuser:fareuser ./alembic ./alembic
COPY --chown=fareuser:fareuser ./templates ./templates

# Changer vers l'utilisateur non-root
USER fareuser

# Port exposé
EXPOSE 8000

# Commande de démarrage (sera surchargée par docker-compose en dev)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]