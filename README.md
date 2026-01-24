# Laburen AI Agent Challenge — MCP (Cloudflare Worker + D1)

Implementación de un **MCP (Model Context Protocol)** desplegado en **Cloudflare Workers** con **Cloudflare D1**(laburen_challenge) como base de datos.

Incluye tools para:
- explorar productos y ver detalles
- cotizar precios por cantidad (tiers)
- crear/actualizar carrito por conversación
- validar stock y consistencia del carrito
- registrar auditoría de requests (tabla `request_logs`)
- (opcional) integración con Chatwoot (labels / handoff)

📚 Documentación: `./docs`

---

## Requisitos
- Node.js 18+ (recomendado 20+)
- npm
- Wrangler (Cloudflare)

Instalar Wrangler si no está:
```bash
npm i -g wrangler
wrangler -v
```

---

## Links de prueba (rápido)
- **WhatsApp (número común):** +1 (555) 827-9088  (5 Mensajes de prueba cada 24hs)
- **Chatwoot (CRM):** https://chatwootchallenge.laburen.com/  
- **MCP (Cloudflare Worker):** https://worker.alvaro-laburen.workers.dev/mcp  
- **Repositorio:** git@github.com:AlvaroArizu/laburen-ai-agent-challenge.git

---

## Quickstart (local)

### 1) Clonar e instalar
```bash
git clone <REPO_URL>
cd <REPO_FOLDER>
npm install
```

### 2) Crear DB D1 local (si no existe)
> Si ya existe, este comando devuelve el ID y no rompe el entorno.
```bash
wrangler d1 create laburen_challenge
```

### 3) Aplicar esquema (local)
> Wrangler ejecuta contra **local** por defecto (sin `--remote`).
```bash
wrangler d1 execute laburen_challenge --file=./schema.sql
```

### 4) Cargar datos de ejemplo (local)

**Datos de prueba (seed):**
- **Input:** `sample-data/products.xlsx` (catálogo fuente)
- **Script:** `./scripts/generate-seed.js` (convierte Excel → SQL)
- **Output:** `./seed.sql` (inserta productos en `products` y extras si aplica)

Opción A — usar el seed listo:
```bash
wrangler d1 execute laburen_challenge --file=./seed.sql

```

Opción B — regenerar el seed desde el Excel (si se necesita):
```bash
node ./scripts/generate-seed.js
# genera/actualiza: ./seed.sql (y archivos auxiliares si aplica)
wrangler d1 execute laburen_challenge --file=./seed.sql
```

Verificar que haya datos:
```bash
wrangler d1 execute laburen_challenge --command "SELECT COUNT(*) AS products FROM products;"
wrangler d1 execute laburen_challenge --command "SELECT COUNT(*) AS carts FROM carts;"
```

Si tu Excel no está en `sample-data/products.xlsx`, cambiá solo esa ruta por la real (por ejemplo `./products.xlsx`).


### 5) Ejecutar worker local
```bash
npm run dev
# o
wrangler dev
```

> El endpoint MCP queda disponible en la URL que imprime Wrangler (por ejemplo `http://localhost:8787`).
> La ruta del MCP suele estar bajo `/mcp` (ver `wrangler.jsonc` / configuración del worker).

---

## Deploy (Cloudflare)

### 1) Crear DB D1 (remote) (si no existe)
```bash
wrangler d1 create laburen_challenge
```

### 2) Aplicar esquema (remote)
```bash
wrangler d1 execute laburen_challenge --remote --file=./schema.sql
```

### 3) Cargar datos (remote)
```bash
wrangler d1 execute laburen_challenge --remote --file=./seed.sql
# o si usás un seed específico para remote:
# wrangler d1 execute laburen_challenge --remote --file=./seed.remote.sql
```

### 4) Variables / secrets
Recomendado cargar tokens como *secrets*:
```bash
wrangler secret put MCP_AUTH_TOKEN
wrangler secret put CHATWOOT_API_TOKEN
```

Variables típicas (según configuración):
- `CHATWOOT_BASE_URL`
- `CHATWOOT_ACCOUNT_ID`

### 5) Deploy
```bash
npm run deploy
# o
wrangler deploy
```

---

## Variables de entorno 
- `DB` (D1 binding) — obligatorio
- `MCP_AUTH_TOKEN` — recomendado (auth Bearer para el endpoint)
- `CHATWOOT_BASE_URL`, `CHATWOOT_ACCOUNT_ID`, `CHATWOOT_API_TOKEN` — opcional (CRM)

Más detalle: `./docs/01_mcp_cloudflare.md`



---

## Docs
- `docs/00_overview.md` — arquitectura + diagramas (conceptual)
- `docs/01_mcp_cloudflare.md` — MCP & Cloudflare (tools, contratos, env)
- `docs/02_db.md` — diseño DB (D1)
- `docs/03_agenteLaburen.md` — comportamiento del agente (prompt/acciones)
- `docs/04_integracion_whatsapp.md` — integración WhatsApp (capturas/config)
- `docs/05_conceptual.md` — Conceptual

---

## Troubleshooting
- Wrangler apunta a **local** si no se usa `--remote`.
- Si el MCP requiere auth, usar `Authorization: Bearer <MCP_AUTH_TOKEN>`.
- Si ves “DB_NAME: No such file or directory”, no uses `<DB_NAME>` literal: reemplazalo por el nombre real (ej. `laburen_challenge`).
