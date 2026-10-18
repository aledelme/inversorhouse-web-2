# Despliegue en Vercel

Este repositorio sustituye al anterior en el **mismo proyecto de Vercel**, así se conservan el
dominio y las variables ya configuradas (Clerk, R2, Stripe, Telegram…).

## 1. Preparativos (una sola vez)

### Base de datos: Neon

1. Vercel → proyecto → **Storage / Integrations** → instala **Neon**.
2. Vincúlalo a _Production_ y _Preview_. Activa la opción de **crear una rama de base de datos por
   cada Preview deployment**: así las previews nunca tocan los datos reales.
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

| Variable                                                | Valor                                                                     | Entornos            |
| ------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------- |
| `DATABASE_URL`                                          | la crea Neon                                                              | Production, Preview |
| `NEXT_PUBLIC_SITE_URL`                                  | `https://inversorhouse.com` (en Preview, la URL de la preview o la misma) | todos               |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | ya existen                                                                | todos               |
| `NEXT_PUBLIC_R2_CLOUDFLARE_URL`                         | ya existe                                                                 | todos               |
| `R2_ACCOUNT_ID`                                         | Account ID de Cloudflare                                                  | todos               |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`              | token del paso anterior                                                   | todos               |
| `R2_PUBLIC_BUCKET`                                      | nombre del bucket público                                                 | todos               |
| `R2_PRIVATE_BUCKET`                                     | nombre del bucket privado                                                 | todos               |
| `ADMIN_EMAILS`                                          | emails de administradores, separados por comas                            | todos               |

**No** definas `R2_ENDPOINT` en Vercel (solo se usa en local con MinIO). `MONGO_DB_URI`, Stripe y
Telegram pueden quedarse: la v2 no los usa.

## 3. Cambiar el repositorio del proyecto

Vercel → proyecto → _Settings → Git_ → **Disconnect** el repositorio antiguo → **Connect** este.
La rama de producción debe ser la rama principal de este repositorio.

## 4. Primer despliegue

1. Haz push: Vercel construye una **Preview** con su propia rama de Neon. Revísala.
2. Carga la geografía en la base de datos de producción **una vez** desde tu máquina. El
   `db:seed` normal se niega a tocar bases remotas a propósito; este script solo inserta
   CCAA, provincias y municipios, pide confirmación y es idempotente:

   ```sh
   DATABASE_URL="<cadena de Neon de producción>" ALLOW_REMOTE=1 pnpm tsx scripts/db-migrate.ts
   DATABASE_URL="<cadena de Neon de producción>" pnpm tsx scripts/db-seed-geo-remote.ts
   ```

3. Promociona a producción y comprueba: home, buscador, alta de usuario, publicar con foto y
   documento, descarga de documento y panel de administración con un email de `ADMIN_EMAILS`.

## 5. Vuelta atrás

Vercel → _Deployments_ → el despliegue anterior → **Promote to Production**. Las migraciones de
este proyecto son aditivas; si una migración rompe algo, se corrige con una migración nueva.
