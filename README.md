# InversorHouse

Marketplace de oportunidades de inversión inmobiliaria: los **promotores** publican operaciones
(CRV, CRA, ocupación, NPL, coinversión) y los **inversores** las buscan y contactan directamente.

- Next.js 16 (App Router, Cache Components) · React 19 · Tailwind 4 + shadcn/ui
- PostgreSQL (Neon) + Drizzle · Clerk · Cloudflare R2 · next-intl (es)

## Empezar

```sh
pnpm install
cp .env.example .env.development.local   # y añade tus claves de Clerk *development*
pnpm dev                                 # Docker + migraciones + http://localhost:3020
pnpm db:seed                             # geografía INE + datos de ejemplo
```

Guía completa: [docs/runbooks/local-dev.md](docs/runbooks/local-dev.md).

## Documentación

| Para                            | Documento                                                                  |
| ------------------------------- | -------------------------------------------------------------------------- |
| Agentes de IA y desarrolladores | [AGENTS.md](AGENTS.md) (y los `AGENTS.md` de cada carpeta)                 |
| Arquitectura                    | [docs/architecture.md](docs/architecture.md)                               |
| Dominio y reglas de negocio     | [docs/domain.md](docs/domain.md)                                           |
| Decisiones (ADR)                | [docs/adr/](docs/adr/)                                                     |
| Despliegue                      | [docs/runbooks/deploy-vercel.md](docs/runbooks/deploy-vercel.md)           |
| Administradores                 | [docs/runbooks/guia-administrador.md](docs/runbooks/guia-administrador.md) |

## Calidad

No hay CI: la batería completa se ejecuta en local y es obligatoria tras cada cambio.

```sh
pnpm verify        # tipos, lint, formato, tests unitarios
pnpm verify:full   # + integración (Postgres en Docker) + e2e (Playwright, build de producción)
```
