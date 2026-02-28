import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import fs from "fs";
import path from "path";

const ASSET_EXTENSIONS: Record<string, string> = {
  '.jpg': 'IMAGE', '.jpeg': 'IMAGE', '.png': 'IMAGE', '.gif': 'IMAGE', '.webp': 'IMAGE', '.svg': 'IMAGE',
  '.pdf': 'PDF',
  '.mp4': 'VIDEO', '.webm': 'VIDEO', '.mov': 'VIDEO', '.avi': 'VIDEO',
};

function getContentDir(): string {
  return process.env.CONTENT_DIR || path.join(process.cwd(), 'content');
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface AssetMeta {
  type?: string;
  description?: string;
  title?: string;
}

function readAssetMeta(filePath: string): AssetMeta {
  const jsonPath = filePath.replace(/\.[^.]+$/, '.json');
  try {
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }
  } catch {}
  return {};
}

function scanFolder(dirPath: string, baseUrl: string): any {
  if (!fs.existsSync(dirPath)) return { subfolders: [], assets: [] };

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  const subfolders: any[] = [];
  const assets: any[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    if (entry.isDirectory()) {
      const subPath = path.join(dirPath, entry.name);
      const childContent = scanFolder(subPath, `${baseUrl}/${encodeURIComponent(entry.name)}`);
      subfolders.push({
        id: slugify(entry.name),
        name: entry.name,
        subfolders: childContent.subfolders,
        assets: childContent.assets,
      });
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.json') continue;

      const baseType = ASSET_EXTENSIONS[ext];
      if (!baseType) continue;

      const fullPath = path.join(dirPath, entry.name);
      const meta = readAssetMeta(fullPath);

      const assetType = meta.type || baseType;
      const displayName = meta.title || entry.name.replace(/\.[^.]+$/, '');

      assets.push({
        id: slugify(entry.name),
        name: displayName,
        type: assetType,
        url: `${baseUrl}/${encodeURIComponent(entry.name)}`,
        description: meta.description || undefined,
      });
    }
  }

  assets.sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  return { subfolders, assets };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/verify", (req, res) => {
    const schema = z.object({ pin: z.string() });
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Code PIN requis." });
    }

    const correctPin = process.env.AUTH_PIN || "0000";

    if (parsed.data.pin === correctPin) {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: "Code PIN incorrect." });
    }
  });

  app.get("/api/folders", (_req, res) => {
    const contentDir = getContentDir();
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    const result = scanFolder(contentDir, '/uploads');
    res.json(result.subfolders);
  });

  app.get("/api/folders/:folderId", (req, res) => {
    const contentDir = getContentDir();
    if (!fs.existsSync(contentDir)) {
      return res.status(404).json({ message: "Content directory not found" });
    }

    function findFolder(dirPath: string, targetSlug: string, baseUrl: string, parentSlug: string | null = null, parentName: string | null = null): any | null {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
        const slug = slugify(entry.name);
        const subPath = path.join(dirPath, entry.name);
        const subUrl = `${baseUrl}/${encodeURIComponent(entry.name)}`;
        if (slug === targetSlug) {
          const content = scanFolder(subPath, subUrl);
          return { id: slug, name: entry.name, parentId: parentSlug, parentName: parentName, ...content };
        }
        const deeper = findFolder(subPath, targetSlug, subUrl, slug, entry.name);
        if (deeper) return deeper;
      }
      return null;
    }

    const folder = findFolder(contentDir, req.params.folderId, '/uploads');
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    res.json(folder);
  });

  const contentDir = getContentDir();
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }
  app.use('/uploads', express.static(contentDir, {
    maxAge: '1d',
    immutable: false,
  }));

  return httpServer;
}
