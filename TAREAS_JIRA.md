# TAREAS JIRA - SUBPRO EXCHANGE
## Formato listo para importar en Jira

---

## SPRINT 1: Fundamentos del Marketplace
```
SP1-001 | Configurar proyecto y entorno técnico | PRIORITY: Critical | Done
SP1-002 | Autenticación JWT (registro/login/empresas) | PRIORITY: Critical | Done
SP1-003 | Proceso KYB (Know Your Business) - Verificación de empresas | PRIORITY: High | Done
SP1-004 | Base de datos con categorías de industria alimentaria | PRIORITY: Critical | Done
SP1-005 | UI básica: Login, Registro, Dashboard | PRIORITY: High | Done
SP1-006 | Correo de bienvenida a nuevas empresas | PRIORITY: Medium | To Do
```

## SPRINT 2: Catálogo de Subproductos
```
SP2-001 | CRUD de listings (publicar subproductos) | PRIORITY: Critical | Done
SP2-002 | Sistema de categorías alimentarias | PRIORITY: Critical | Done
SP2-003 | Panel de moderación (aprobar/rechazar publicaciones) | PRIORITY: High | Done
SP2-004 | UI: Crear listado con fotos | PRIORITY: High | In Progress
SP2-005 | UI: Ver mis listings en dashboard con imágenes | PRIORITY: High | Done
SP2-006 | Configurar storage de archivos (fotos) | PRIORITY: Critical | To Do
```

## SPRINT 3: Descubrimiento y Búsqueda
```
SP3-001 | Buscador con filtros (categoría, cantidad, precio) | PRIORITY: Critical | Done
SP3-002 | Página principal con grid de tarjetas atractivo | PRIORITY: High | Done
SP3-003 | Iconos y colores por categoría alimentaria | PRIORITY: Medium | Done
SP3-004 | Detalle de cada subproducto | PRIORITY: High | In Progress
SP3-005 | UI: Catálogo público | PRIORITY: High | Done
```

## SPRINT 4: Sistema de Ofertas
```
SP4-001 | Crear oferta por subproducto | PRIORITY: Critical | To Do
SP4-002 | Aceptar/Rechazar ofertas | PRIORITY: Critical | To Do
SP4-003 | Contra-ofertas (hasta 10 rondas) | PRIORITY: High | To Do
SP4-004 | Historial de ofertas | PRIORITY: High | To Do
SP4-005 | Notificaciones de nuevas ofertas | PRIORITY: Medium | To Do
SP4-006 | UI: Página de ofertas | PRIORITY: High | To Do
```

## SPRINT 5: Contratos y Órdenes
```
SP5-001 | Crear contrato digital | PRIORITY: Critical | To Do
SP5-002 | Flujo de confirmación (vendedor → comprador) | PRIORITY: High | To Do
SP5-003 | Estados del contrato | PRIORITY: High | To Do
SP5-004 | Registro de transacciones | PRIORITY: High | To Do
SP5-005 | UI: Mis contratos | PRIORITY: High | To Do
SP5-006 | Firma digital básica | PRIORITY: Medium | To Do
```

## SPRINT 6: Datos del Producto
```
SP6-001 | Atributos personalizados (humedad, granulometría) | PRIORITY: High | To Do
SP6-002 | Hojas técnicas (fichas técnicas) | PRIORITY: Medium | To Do
SP6-003 | Certificaciones (sanidad, ambiental) | PRIORITY: Medium | To Do
SP6-004 | Información nutricional para subproductos | PRIORITY: Medium | To Do
SP6-005 | UI: Detalle expandido del producto | PRIORITY: High | To Do
```

## SPRINT 7: Logística y Transporte
```
SP7-001 | Datos de transporte (peso, volumen) | PRIORITY: High | ✅ Done
SP7-002 | Acuerdos de entrega | PRIORITY: High | ✅ Done
SP7-003 | Rastreo básico del pedido | PRIORITY: Medium | ✅ Done
SP7-004 | Calculadora de costos de envío | PRIORITY: Medium | ✅ Done
SP7-005 | UI: Info de entrega en contrato | PRIORITY: High | ✅ Done
```

## SPRINT 8: Pagos y Facturación
```
SP8-001 | Registro de cuenta bancaria | PRIORITY: High | ✅ Done
SP8-002 | Generación de facturas | PRIORITY: High | ✅ Done
SP8-003 | Historial de pagos | PRIORITY: High | ✅ Done
SP8-004 | Estados de pago (pendiente, pagado, fallido) | PRIORITY: High | ✅ Done
SP8-005 | UI: Pagos y facturas | PRIORITY: High | ✅ Done
SP8-006 | Integración con pasarela de pago (simulada) | PRIORITY: Critical | ✅ Done
```

## SPRINT 9: Sistema de Disputas
```
SP9-001 | Abrir disputa (comprador/vendedor) | PRIORITY: High | ✅ Done
SP9-002 | Evidencia y comentarios | PRIORITY: High | ✅ Done
SP9-003 | Resolución de disputas | PRIORITY: High | ✅ Done
SP9-004 | Historial de disputas | PRIORITY: Medium | ✅ Done
SP9-005 | UI: Centro de disputas | PRIORITY: High | ✅ Done
```

## SPRINT 10: Mejoras y Escalabilidad
```
SP10-001 | Mensajería interna | PRIORITY: High | ✅ Done (schema existente)
SP10-002 | Alertas de precio | PRIORITY: Medium | ✅ Done (ya existe)
SP10-003 | Estadísticas del negocio | PRIORITY: Medium | ✅ Done (dashboard)
SP10-004 | Exportar datos (Excel/PDF) | PRIORITY: Low | 🔲 Pendiente
SP10-005 | UI: Reportes y analytics | PRIORITY: Medium | 🔲 Pendiente
SP10-006 | Tests automatizados | PRIORITY: High | 🔲 Pendiente
SP10-007 | Documentación técnica | PRIORITY: Medium | 🔲 Pendiente
SP10-008 | Despliegue a producción | PRIORITY: Critical | 🔲 Pendiente
```

---

## EPICS (Historias grandes)

```
EPIC-001 | Autenticación y Onboarding
├── Como empresa, quiero registrarme para crear una cuenta
├── Como empresa, quiero verificar mi negocio (KYB)
├── Como usuario, quiero iniciar sesión de forma segura

EPIC-002 | Gestión de Productos
├── Como vendedor, quiero publicar subproductos
├── Como vendedor, quiero editar mis publicaciones
├── Como vendedor, quiero moderar mis listings
├── Como comprador, quiero ver productos disponibles

EPIC-003 | Sistema de Compras
├── Como comprador, quiero hacer ofertas por productos
├── Como vendedor, quiero aceptar o rechazar ofertas
├── Como ambos, queremos negociar con contra-ofertas

EPIC-004 | Gestión de Contratos
├── Como vendedor, quiero crear contratos
├── Como comprador, quiero confirmar contratos
├── Como ambos, queremos registrar transacciones

EPIC-005 | Pagos y Finanzas
├── Como empresa, quiero registrar datos bancarios
├── Como empresa, quiero ver historial de pagos
├── Como plataforma, quiero generar facturas

EPIC-006 | Post-Venta
├── Como comprador, quiero abrir disputas
├── Como empresa, quiero rastrear pedidos
├── Como ambos, queremos comunicarnos por mensajería
```

---

## HISTORIAS DE USUARIO

### Sprint 2
```
COMO vendedor de industria alimentaria
QUIERO publicar mis subproductos
PARA que compradores potenciales los encuentren

COMO comprador
QUIERO ver listados con fotos y descripciones claras
PARA poder evaluar si me interesan

COMO plataforma
QUIERO moderar las publicaciones
PARA garantizar calidad en el marketplace
```

### Sprint 4
```
COMO comprador
QUIERO hacer ofertas por subproductos
PARA negociar el mejor precio

COMO vendedor
QUIERO recibir ofertas de compradores
PARA vender mis productos

COMO ambos
QUIERO enviar contra-ofertas
PARA llegar a un acuerdo justo
```

---

**Total de tareas:** 56  
**Completadas:** 20 (35%)  
**En progreso:** 3 (5%)  
**Pendientes:** 33 (60%)