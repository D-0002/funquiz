import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/serve-static';
import { routes } from "../controllers/routes.js";
import path from 'path';
import fs from 'fs/promises';

const app = new Hono();
const prisma = new PrismaClient();

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
(async () => {
    try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        console.log(`Uploads directory ensured at: ${UPLOADS_DIR}`);
    } catch (err) {
        console.error('Error creating uploads directory:', err);
    }
})();

app.use('/api/*', cors({
  origin: '*', 
}));

app.get('/uploads/:filename', async (c) => {
  try {
    const filename = c.req.param('filename');
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    const normalizedPath = path.normalize(filePath);
    const uploadsDir = path.normalize(path.join(process.cwd(), 'uploads'));
    
    if (!normalizedPath.startsWith(uploadsDir)) {
      return c.text('Access denied', 403);
    }
    
    try {
      await fs.access(filePath);
    } catch {
      return c.text('File not found', 404);
    }
    
    const fileBuffer = await fs.readFile(filePath);
    
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }
    
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      }
    });
    
  } catch (error) {
    console.error('Error serving file:', error);
    return c.text('Internal server error', 500);
  }
});

prisma.$connect()
  .then(() => {
    console.log('Connected to the database successfully!');
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
  });

routes.forEach((route) => {
  app.route("/", route);
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});