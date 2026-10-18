# Desarrollo local

## Requisitos

- Node 22 (`.nvmrc`), pnpm 11 (`corepack enable`), Docker Desktop en marcha.

## Primera vez

```sh
pnpm install
cp .env.example .env.development.local   # dev
cp .env.example .env.production.local    # prod:local / e2e (cambia NEXT_PUBLIC_SITE_URL a :3021)
pnpm dev                                 # levanta Docker, migra y arranca en http://localhost:3020
pnpm db:seed                             # geografía INE + datos de ejemplo
```

### Clerk en local

Usa siempre las claves de la instancia **Development** de Clerk (`pk_test_…` / `sk_test_…`),
nunca las de producción: Clerk Dashboard → selector de instancia "Development" → API keys.
Si las dejas vacías, `pnpm dev` arranca Clerk en modo _keyless_ (claves temporales), suficiente
para probar. Para `pnpm prod:local` y los tests e2e las claves de desarrollo son obligatorias.

Para entrar como administrador en local, pon tu email (verificado en la instancia de desarrollo)
en `ADMIN_EMAILS`.

## Comandos del día a día

| Qué                                             | Comando                                       |
| ----------------------------------------------- | --------------------------------------------- |
| Arrancar en desarrollo                          | `pnpm dev` (puerto 3020 o el siguiente libre) |
| Build de producción en local (debug)            | `pnpm prod:local` (puerto 3021+)              |
| Ver/editar datos                                | `pnpm db:studio`                              |
| Empezar de cero la BD local                     | `pnpm db:reset`                               |
| Parar / borrar servicios Docker                 | `pnpm services:down` / `pnpm services:reset`  |
| Comprobación rápida                             | `pnpm verify`                                 |
| Batería completa (obligatoria tras cada cambio) | `pnpm verify:full`                            |

## Puertos

| Servicio                   | Puerto             | Variable para cambiarlo            |
| -------------------------- | ------------------ | ---------------------------------- |
| App dev / prod:local / e2e | 3020 / 3021 / 3022 | `PORT`, `E2E_PORT`                 |
| Postgres dev / test        | 5442 / 5443        | `IH_PG_PORT`, `IH_PG_TEST_PORT`    |
| MinIO API / consola        | 9010 / 9011        | `IH_S3_PORT`, `IH_S3_CONSOLE_PORT` |

Consola de MinIO: http://localhost:9011 (usuario `inversorhouse`, contraseña `inversorhouse-secret`).

## Seguridad

Los scripts se niegan a arrancar si `DATABASE_URL` o `R2_ENDPOINT` apuntan fuera de `localhost`
(ver `scripts/lib/env.ts`). Para conectar `pnpm dev` a una BD remota a conciencia:
`ALLOW_REMOTE=1 pnpm dev`. `db:seed`, `db:reset` y los tests nunca lo permiten.
