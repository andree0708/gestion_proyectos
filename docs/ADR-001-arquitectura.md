# ADR-001: Arquitectura SubPro Exchange

## Estado
Aceptado

## Contexto
Plataforma B2B de subproductos industriales con catálogo, ofertas, contratos, pagos, logística y disputas.

## Decisión
- **Frontend:** React + Vite + TypeScript, proxy a API en desarrollo.
- **Backend:** Express + Prisma + PostgreSQL.
- **Auth:** JWT (access + refresh).
- **Archivos:** Multer en `/uploads`.
- **Pagos:** Stripe cuando `STRIPE_SECRET_KEY` está configurado; simulación en desarrollo.

## Consecuencias
- Despliegue separado cliente (Vercel) y servidor (Node).
- Migraciones con Prisma `db push` / `migrate`.
