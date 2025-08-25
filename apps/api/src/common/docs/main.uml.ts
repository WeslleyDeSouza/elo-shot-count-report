import { INestApplication, INestApplicationContext } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ERDBuilder } from 'typeorm-erd';
import * as fs from 'node:fs';
import * as path from 'node:path';

export async function setupMermaidUml(app: INestApplication | INestApplicationContext) {
  // 1) Resolve the same DataSource Nest uses
  const dataSource = app.get(DataSource);

  // 2) Build ERD (Mermaid)
  const erd = new ERDBuilder('mermaid', dataSource);
  await erd.initialize();
  const mermaid = await erd.render();

  // 3) Expose endpoints if it's a web app
  if ('getHttpAdapter' in app) {
    const httpAdapter = (app as INestApplication).getHttpAdapter();
    const router = httpAdapter.getInstance();

    // raw Mermaid text
    router.get('/erd/mermaid.mmd', (_req, res) => {
      res.type('text/plain').send(mermaid);
    });

    // quick HTML viewer (Mermaid CDN)
    router.get('/erd', (_req, res) => {
      const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>ERD (Mermaid)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:24px;font-family:system-ui,Segoe UI,Roboto">
  <h1 style="margin-top:0">Entity Relationship Diagram</h1>
  <div class="mermaid">
${mermaid}
  </div>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'default' });</script>
</body>
</html>`;
      res.type('text/html').send(html);
    });
  }

  // 4) Persist to repo in dev (skip prod)
  if (process.env.APP_ENV !== 'production') {
    const outDir = path.resolve('./config');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'uml.mmd'), mermaid, 'utf8');
  }
}
