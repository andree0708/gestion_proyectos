# Guía de despliegue - SubPro Exchange V2

## Requisitos
- Node.js 20+
- PostgreSQL 14+
- Variables de entorno en `server/.env`

## Variables de entorno
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
PORT=3001
STRIPE_SECRET_KEY=sk_... (opcional, producción)
```

## Backend
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run build
npm start
```

## Frontend
```bash
cd client
npm install
npm run build
```
Desplegar `client/dist` en Vercel o similar. Configurar proxy `/api` al backend.

## Checklist pre-producción
- [ ] KYB y roles configurados
- [ ] HTTPS habilitado
- [ ] CORS restringido al dominio del cliente
- [ ] Backups de base de datos
- [ ] Revisión OWASP (ver SECURITY.md)
