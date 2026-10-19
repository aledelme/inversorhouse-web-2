# Despliegue en Vercel

Este repositorio sustituye al anterior en el **mismo proyecto de Vercel**, así se conservan el
dominio y las variables ya configuradas (Clerk, R2, Stripe, Telegram…).

## 1. Preparativos (una sola vez)

### Base de datos: Neon

1. Vercel → proyecto → **Storage / Integrations** → instala **Neon**.
2. Vincúlalo solo a _Production_ y deja **desactivada** la creación de ramas por preview: no usamos
   Preview deployments (ver "Sin previews" más abajo y ADR-0012).
3. La integración crea `DATABASE_URL` (usa la cadena _pooled_ si te da a elegir).

Las migraciones se aplican solas en cada despliegue (`vercel.json` → `pnpm db:migrate && pnpm build`).
La geografía (CCAA, provincias y municipios) se carga una vez con el seed de geografía (ver paso 4).

### Almacenamiento: Cloudflare R2

1. **Bucket público** (el que ya existe, servido en `NEXT_PUBLIC_R2_CLOUDFLARE_URL`): fotos.
2. Crea un **bucket privado** nuevo (sin dominio público ni acceso público): documentación.
3. R2 → _Manage API tokens_ → crea un token **Object Read & Write** limitado a esos dos buckets.
   Obtendrás `Access Key ID`, `Secret Access Key` y el `Account ID`.
4. CORS en **ambos** buckets (Settings → CORS policy):

```json
[
  {
    "AllowedOrigins": [
      "https://inversorhouse.com",
      "https://www.inversorhouse.com",
      "https://*.vercel.app"
    ],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

### Clerk

Se usan las **mismas claves de producción** que ya están en Vercel (los usuarios se conservan).
No hace falta webhook. Opcional pero recomendable: en Clerk → _User & Authentication_ activa
nombre y apellidos, porque el nombre se muestra a la otra parte en los contactos.

## 2. Variables de entorno en Vercel

Todas en el entorno **Production** (no hay previews).

| Variable                                                | Valor                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`                                          | la crea Neon                                                 |
| `NEXT_PUBLIC_SITE_URL`                                  | `https://inversorhouse.com`                                  |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | ya existen                                                   |
| `NEXT_PUBLIC_R2_CLOUDFLARE_URL`                         | ya existe                                                    |
| `R2_ACCOUNT_ID`                                         | Account ID de Cloudflare                                     |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`              | token del paso anterior                                      |
| `R2_PUBLIC_BUCKET`                                      | nombre del bucket público                                    |
| `R2_PRIVATE_BUCKET`                                     | nombre del bucket privado                                    |
| `ADMIN_EMAILS`                                          | emails de administradores, separados por comas               |
| `CRON_SECRET`                                           | secreto aleatorio de 16+ caracteres (`openssl rand -hex 32`) |

`CRON_SECRET` protege la limpieza diaria de ficheros huérfanos en R2 (ADR-0011): Vercel Cron la
ejecuta según `vercel.json` y envía el secreto automáticamente. Sin esta variable la limpieza no se
ejecuta (la ruta responde 401). Se puede comprobar en Vercel → proyecto → _Cron Jobs_.

**No** definas `R2_ENDPOINT` en Vercel (solo se usa en local con MinIO). `MONGO_DB_URI`, Stripe y
Telegram pueden quedarse: la v2 no los usa.

## 3. Cambiar el repositorio del proyecto

Vercel → proyecto → _Settings → Git_ → **Disconnect** el repositorio antiguo → **Connect** este.
La rama de producción debe ser la rama principal de este repositorio.

### Sin previews

No usamos Preview deployments: compartirían Clerk y R2 de producción (usuarios y ficheros reales).
Desactívalos en _Settings → Git → Ignored Build Step_ → **Only build production**. La revisión
previa se hace en local con `pnpm verify:full` y `pnpm prod:local`.

## 4. Primer despliegue

1. Antes de hacer push, revisa en local con `pnpm verify:full` y `pnpm prod:local`.
2. Carga la geografía en la base de datos de producción **una vez** desde tu máquina. El
   `db:seed` normal se niega a tocar bases remotas a propósito; este script solo inserta
   CCAA, provincias y municipios, pide confirmación y es idempotente:

   ```sh
   DATABASE_URL="<cadena de Neon de producción>" ALLOW_REMOTE=1 pnpm tsx scripts/db-migrate.ts
   DATABASE_URL="<cadena de Neon de producción>" pnpm tsx scripts/db-seed-geo-remote.ts
   ```

3. Haz push a la rama principal (despliega a producción) y comprueba: home, buscador, alta de usuario, publicar con foto y
   documento, descarga de documento y panel de administración con un email de `ADMIN_EMAILS`.

## 5. Vuelta atrás

Vercel → _Deployments_ → el despliegue anterior → **Promote to Production**. Las migraciones de
este proyecto son aditivas; si una migración rompe algo, se corrige con una migración nueva.
