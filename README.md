# Emmanuel Rojas Studio — Portal

Portal premium para Emmanuel Rojas Studio. Sitio público + dashboard de admin para gestionar clientes, galerías privadas y fotos. Todo el almacenamiento es local en el servidor (JSON + filesystem), pensado para deploy en **Hostinger Node.js / VPS / Cloud Hosting**.

---

## Stack

- **Next.js 15** (App Router) — `output: "standalone"`
- **React 19**
- **bcryptjs** — hash de PINs de clientes y admin
- **Sharp** — imágenes
- Almacenamiento: `data/db.json` (clientes/galerías/imágenes) + `uploads/galleries/` (archivos)

No requiere Supabase, ni Cloudflare, ni servicios externos.

---

## Estructura

```
app/
├── page.tsx              # Home pública
├── admin-login/          # Login del admin
├── admin/                # Dashboard (protegido por cookie)
└── api/
    ├── admin/upload/     # POST: sube imágenes a una galería
    └── files/[...path]/  # GET: sirve imágenes desde uploads/

src/lib/
├── admin-auth/   # Sesión por cookie httpOnly
├── db/           # Lectura/escritura del JSON
├── galleries/    # Slugs
└── security/     # Hashing de PINs

data/db.json      # Generado en runtime — clientes, galerías, imágenes
uploads/          # Generado en runtime — archivos subidos
```

---

## Desarrollo local

```bash
npm install
npm run dev
# http://localhost:3000
```

Login admin por defecto (cambiar en producción):
- Usuario: `emma`
- PIN: pídeselo al desarrollador o regenera el hash en `src/lib/admin-auth/config.ts`

Para regenerar el hash del PIN:
```bash
node -e "require('bcryptjs').hash('TU_PIN_NUEVO', 12).then(console.log)"
```
Y pega el resultado en `ADMIN_PIN_HASH`.

---

## Deploy en Hostinger

Hostinger tiene varios planes; este proyecto necesita **Node.js** (VPS, Cloud Hosting, o cualquier plan con soporte Node.js, no shared hosting básico).

### 1. Build local de prueba

```bash
npm install
npm run build
```

Esto genera la carpeta `.next/standalone/` con un servidor Node.js autocontenido.

### 2. Preparar el paquete de deploy

Hostinger necesita estos archivos en el servidor:

```
emmanuel-portal/
├── .next/standalone/    ← TODO el contenido
├── .next/static/        ← copiar manualmente
├── public/              ← copiar manualmente
├── data/                ← se crea al primer guardado
├── uploads/             ← se crea al primer upload
└── node_modules/        ← solo si Hostinger no instala
```

Comando para preparar el paquete localmente:

```bash
npm run build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
# .next/standalone/ ahora es 100% deployable
```

### 3. Subir a Hostinger

**Opción A — Git (recomendado)**

1. Conecta tu repositorio GitHub en hPanel → Websites → Git
2. Pull en el servidor
3. En la terminal SSH del VPS:
   ```bash
   cd /home/user/htdocs/emmanuel
   npm install
   npm run build
   cp -r .next/static .next/standalone/.next/
   cp -r public .next/standalone/
   ```
4. Crea un servicio Node.js apuntando a `.next/standalone/server.js`

**Opción B — FTP/SFTP**

1. Sube todo el repo (excepto `node_modules/`, `.next/`)
2. SSH al servidor, ejecuta `npm install && npm run build`
3. Igual al paso 3 de la opción A

### 4. Configurar Node.js en hPanel

En **hPanel → Hosting → Advanced → Node.js**:

| Campo | Valor |
|---|---|
| Application root | `/home/user/htdocs/emmanuel` (o donde lo subiste) |
| Application URL | tu dominio |
| Application startup file | `.next/standalone/server.js` |
| Node.js version | 20.x o superior |
| Environment | Production |

Variable de entorno requerida (opcional, default 3000):
```
PORT=3000
HOSTNAME=0.0.0.0
```

### 5. Permisos de escritura

Asegúrate de que el proceso Node.js puede escribir en estas carpetas:

```bash
mkdir -p data uploads
chmod 755 data uploads
```

Si Hostinger ejecuta Node como otro usuario, ajusta los permisos:
```bash
chown -R nodeuser:nodeuser data uploads
```

### 6. Variables de entorno

Por defecto **no necesitas ninguna variable de entorno** para que la app funcione. Las credenciales del admin están en `src/lib/admin-auth/config.ts` (hardcoded, hash de bcrypt).

Si quieres ocultar las credenciales del repo en el futuro, agrega:

```bash
ADMIN_USERNAME=emma
ADMIN_PIN_HASH=$2b$12$...
```

Y modifica `src/lib/admin-auth/config.ts` para leerlas con `process.env`.

---

## ⚠️ Importante

- **`data/db.json` y `uploads/` NO están versionados en Git.** Si redeplyeas perdiendo el filesystem, perderás los datos. Haz backup periódico.
- Para sites con mucho tráfico considera migrar `data/db.json` a una DB real (MySQL en Hostinger Premium/Business o externa).
- Las imágenes se sirven a través de `/api/files/galleries/{slug}/{filename}` — no se exponen como archivos estáticos directos.

---

## Scripts

```bash
npm run dev    # Desarrollo (puerto 3000)
npm run build  # Build de producción
npm start      # Servidor de producción local
npm run lint   # Linter
```

---

## Endpoints

| Ruta | Método | Descripción |
|---|---|---|
| `/` | GET | Home pública |
| `/admin-login` | GET/POST | Login admin |
| `/admin` | GET | Dashboard (requiere sesión) |
| `/api/admin/upload` | POST | Sube imágenes a una galería (multipart/form-data) |
| `/api/files/[...path]` | GET | Sirve imágenes del servidor |
