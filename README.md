# Nous Sommes Audi

Plateforme confidentielle de présentation des assets de communication Audi, développée par Romance Agency.

## Fonctionnalités

- Navigation dans un répertoire structuré de campagnes et activations
- Lecture automatique des fichiers depuis un dossier sur le serveur
- Affichage des assets avec mockups adaptés selon le format :
  - **IMAGE** : Affichage plein écran
  - **PDF** : Téléchargement / visualisation
  - **VIDEO** : Lecteur standard
  - **VIDEO_TIKTOK** : Mockup iPhone avec interface TikTok
  - **VIDEO_FB** : Mockup iPhone avec interface Facebook
  - **VIDEO_INSTAGRAM** : Mockup iPhone avec interface Instagram
  - **VIDEO_TV** : Mockup écran de télévision
  - **VIDEO_IPAD** : Mockup tablette iPad
- Descriptions associées à chaque asset via fichiers JSON
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
git clone https://github.com/aka9871/nous-sommes-audi.git
cd nous-sommes-audi
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet :

```env
AUTH_PIN=votre_code_pin
PORT=5000
CONTENT_DIR=/chemin/vers/votre/dossier/content
```

| Variable      | Description                                         | Requis |
| ------------- | --------------------------------------------------- | ------ |
| `AUTH_PIN`    | Code PIN pour l'authentification utilisateur         | Oui    |
| `PORT`        | Port du serveur (défaut : 5000)                     | Non    |
| `CONTENT_DIR` | Chemin absolu vers le dossier des assets (défaut : `./content`) | Non    |

## Le dossier `content/` — Guide pour les webmasters

C'est le dossier principal où déposer tous les assets. L'application le scanne automatiquement et affiche son contenu.

### Emplacement

Par défaut : `content/` à la racine du projet.
Ou bien, définissez `CONTENT_DIR` dans le `.env` pour pointer vers un autre chemin (ex: `/var/www/nous-sommes-audi/content`).

### Structure attendue

```
content/
├── 01 - Communication territory - Nous Sommes Audi/
│   ├── 360 territory/
│   │   ├── hero-visual.jpg              ← Image affichée automatiquement
│   │   ├── hero-visual.json             ← Métadonnées (titre, description, type)
│   │   ├── spot-tv-30s.mp4
│   │   └── spot-tv-30s.json
│   └── Focus Digital tone of voice/
│       ├── tiktok-trend.mp4
│       ├── tiktok-trend.json
│       └── guidelines-digital.pdf
├── 02 - F1 creative activations/
│   ├── visuel-f1.jpg
│   └── visuel-f1.json
├── 03 - Audi Q3 creative campaign/
├── ...
└── 09 - Focus Social Media/
    ├── instagram-reel-q4.mp4
    └── instagram-reel-q4.json
```

### Comment ajouter un asset

1. **Déposez le fichier** (image, vidéo, PDF) dans le bon sous-dossier
2. **Créez un fichier JSON** avec le même nom (sans l'extension du fichier) pour ajouter un titre, une description et le type d'affichage

### Format du fichier JSON

Le fichier JSON doit porter le **même nom que l'asset** mais avec l'extension `.json`.

Par exemple, pour un fichier `spot-tv.mp4`, créez `spot-tv.json` :

```json
{
  "title": "Spot TV 30 secondes",
  "description": "Le spot TV principal de la campagne Nous Sommes Audi, diffusé sur TF1 et M6.",
  "type": "VIDEO_TV"
}
```

### Types disponibles pour le champ `type`

| Type              | Affichage                                |
| ----------------- | ---------------------------------------- |
| `IMAGE`           | Affichage plein écran (par défaut pour .jpg, .png, etc.) |
| `PDF`             | Bouton de téléchargement (par défaut pour .pdf) |
| `VIDEO`           | Lecteur vidéo standard (par défaut pour .mp4, .webm, etc.) |
| `VIDEO_TIKTOK`    | Mockup iPhone avec interface TikTok      |
| `VIDEO_FB`        | Mockup iPhone avec interface Facebook    |
| `VIDEO_INSTAGRAM` | Mockup iPhone avec interface Instagram   |
| `VIDEO_TV`        | Mockup écran de télévision               |
| `VIDEO_IPAD`      | Mockup tablette iPad                     |

**Si vous ne créez pas de fichier JSON**, l'asset sera affiché avec le type par défaut (IMAGE pour les images, VIDEO pour les vidéos, PDF pour les PDFs) et le nom du fichier sera utilisé comme titre.

### Extensions de fichiers supportées

- **Images** : `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
- **Vidéos** : `.mp4`, `.webm`, `.mov`, `.avi`
- **Documents** : `.pdf`

### Astuce : Ordre d'affichage

Les dossiers et fichiers sont triés par ordre alphabétique. Préfixez vos dossiers avec des numéros pour contrôler l'ordre :
```
01 - Communication territory/
02 - F1 creative activations/
03 - Audi Q3 creative campaign/
```

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
git clone https://github.com/aka9871/nous-sommes-audi.git /var/www/nous-sommes-audi
cd /var/www/nous-sommes-audi

# 2. Installer les dépendances
npm install

# 3. Créer le fichier d'environnement
cp .env.example .env
nano .env
# Renseigner AUTH_PIN, CONTENT_DIR

# 4. Créer le dossier content avec la structure
mkdir -p content

# 5. Build l'application
npm run build

# 6. Démarrer en production
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
  -e CONTENT_DIR=/data/content \
  -v /chemin/local/content:/data/content \
  --name nous-sommes-audi \
  nous-sommes-audi
```

### Configuration Nginx (reverse proxy)

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    client_max_body_size 500M;

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
│   │   ├── data/           # Types TypeScript
│   │   ├── pages/          # Pages de l'application
│   │   └── index.css       # Design system (couleurs, typo Audi)
│   └── index.html
├── server/                 # Backend Express
│   ├── routes.ts           # API endpoints + scan du dossier content
│   └── index.ts            # Serveur principal
├── shared/                 # Types partagés
│   └── schema.ts
├── content/                # DOSSIER DES ASSETS (webmasters déposent ici)
└── attached_assets/        # Polices Audi Type et logos
```

## Confidentialité

Ce répertoire est strictement réservé à un usage interne Audi et Romance Agency. Toute reproduction, distribution ou communication à des tiers sans autorisation préalable est formellement interdite.

---

Développé par **Romance Agency** pour **Audi France**
