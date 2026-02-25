# Nous Sommes Audi

Plateforme confidentielle de présentation des assets de communication Audi, développée par Romance Agency.

## Fonctionnalités

- Navigation dans un répertoire structuré de campagnes et activations
- Affichage des assets avec mockups adaptés selon le format :
  - **IMAGE** : Affichage plein écran
  - **PDF** : Téléchargement / visualisation
  - **VIDEO** : Lecteur standard
  - **VIDEO TIKTOK** : Mockup iPhone avec interface TikTok
  - **VIDEO FB** : Mockup iPhone avec interface Facebook
  - **VIDEO INSTAGRAM** : Mockup iPhone avec interface Instagram
  - **VIDEO TV** : Mockup écran de télévision
  - **VIDEO IPAD** : Mockup tablette iPad
- Descriptions associées à chaque asset (sauf PDF) via fichiers JSON
- Authentification par code PIN sécurisé côté serveur
- Design charté avec typographie Audi Type officielle

## Stack Technique

- **Frontend** : React 19, TypeScript, TailwindCSS v4, Framer Motion, Wouter
- **Backend** : Express 5, Node.js
- **Build** : Vite 7
- **UI** : Radix UI / shadcn components

## Prérequis

- **Node.js** >= 20
- **npm** >= 10

## Installation

```bash
git clone <url-du-repo>
cd nous-sommes-audi
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet :

```env
AUTH_PIN=votre_code_pin
PORT=5000
```

| Variable   | Description                                    | Requis |
| ---------- | ---------------------------------------------- | ------ |
| `AUTH_PIN`  | Code PIN pour l'authentification utilisateur    | Oui    |
| `PORT`      | Port du serveur (défaut : 5000)                | Non    |

## Développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5000`.

## Build de Production

```bash
npm run build
```

Les fichiers compilés seront générés dans le dossier `dist/`.

## Déploiement sur votre serveur

### Option 1 : Serveur Node.js classique (VPS / Serveur dédié)

```bash
# 1. Cloner le repo sur votre serveur
git clone <url-du-repo> /var/www/nous-sommes-audi
cd /var/www/nous-sommes-audi

# 2. Installer les dépendances
npm install

# 3. Créer le fichier d'environnement
cp .env.example .env
nano .env
# Renseigner AUTH_PIN=votre_code_pin

# 4. Build l'application
npm run build

# 5. Démarrer en production
NODE_ENV=production node dist/index.cjs
```

### Option 2 : Avec PM2 (recommandé pour la production)

```bash
# Installer PM2 globalement
npm install -g pm2

# Build
npm run build

# Démarrer avec PM2
pm2 start dist/index.cjs --name "nous-sommes-audi" --env production

# Configurer le démarrage automatique
pm2 startup
pm2 save
```

### Option 3 : Avec Docker

Créez un fichier `Dockerfile` :

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/index.cjs"]
```

```bash
# Build l'image
docker build -t nous-sommes-audi .

# Lancer le conteneur
docker run -d \
  -p 5000:5000 \
  -e AUTH_PIN=votre_code_pin \
  --name nous-sommes-audi \
  nous-sommes-audi
```

### Configuration Nginx (reverse proxy)

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL avec Certbot (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

## Structure du projet

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants UI
│   │   │   ├── auth/       # Authentification (PIN)
│   │   │   ├── layout/     # Layout principal
│   │   │   └── media/      # Mockups devices (iPhone, iPad, TV)
│   │   ├── data/           # Données et structure des dossiers
│   │   ├── pages/          # Pages de l'application
│   │   └── index.css       # Design system (couleurs, typo Audi)
│   └── index.html
├── server/                 # Backend Express
│   ├── routes.ts           # API endpoints
│   └── index.ts            # Serveur principal
├── shared/                 # Types partagés
│   └── schema.ts
└── attached_assets/        # Polices Audi Type et logos
```

## Ajouter des assets

Pour ajouter des contenus dans un dossier, modifiez le fichier `client/src/data/mockData.ts`. Chaque asset suit cette structure :

```typescript
{
  id: "unique-id",
  name: "Nom de l'asset",
  type: "IMAGE" | "PDF" | "VIDEO" | "VIDEO_TIKTOK" | "VIDEO_FB" | "VIDEO_INSTAGRAM" | "VIDEO_TV" | "VIDEO_IPAD",
  url: "chemin/vers/fichier",
  description: "Texte explicatif affiché à côté de l'asset"
}
```

## Confidentialité

Ce répertoire est strictement réservé à un usage interne Audi et Romance Agency. Toute reproduction, distribution ou communication à des tiers sans autorisation préalable est formellement interdite.

---

Développé par **Romance Agency** pour **Audi France**
