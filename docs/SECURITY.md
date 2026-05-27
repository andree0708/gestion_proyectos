# Checklist de seguridad (OWASP básico)

## Autenticación
- Contraseñas hasheadas con bcrypt
- JWT con expiración y refresh token
- Rutas protegidas con middleware `authenticate`

## Autorización
- Roles: admin, moderator, buyer, seller
- Verificación de `orgId` en operaciones de órdenes, pagos y disputas

## Datos
- Validación de entrada en controladores
- Prisma parametrizado (anti SQL injection)
- No exponer contraseñas en respuestas API

## Recomendaciones producción
- Rate limiting en `/api/auth/login`
- Helmet.js en Express
- Auditoría en tabla `audit_logs`
- Pentest externo antes de go-live
