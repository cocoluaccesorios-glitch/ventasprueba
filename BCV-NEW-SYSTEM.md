# Sistema de Tasa BCV - Nueva Lógica

## Descripción

El sistema ahora funciona de manera más eficiente y confiable:

1. **Script diario independiente** actualiza la tasa BCV automáticamente
2. **Aplicación web** solo busca en la base de datos
3. **Sin tasas de respaldo** - solo tasas reales o entrada manual

## Flujo del Sistema

### 1. Actualización Automática Diaria
- **Script**: `scripts/update-bcv-daily.js`
- **Frecuencia**: Diario a las 8:00 AM (configurable)
- **Proceso**:
  1. Obtiene tasa actual del BCV (bcv.org.ve)
  2. Verifica si existe tasa para hoy en BD
  3. Si no existe → inserta nueva tasa
  4. Si existe y es diferente → actualiza
  5. Si existe y es igual → no hace nada

### 2. Uso en la Aplicación
- **Servicio**: `src/services/bcvService.js`
- **Proceso**:
  1. Busca tasa para hoy en BD
  2. Si existe → la usa
  3. Si no existe → solicita entrada manual
  4. Guarda tasa manual en BD

## Configuración

### Instalar Automatización
```bash
# Ejecutar script de configuración
./scripts/setup-bcv-automation.sh
```

### Probar Manualmente
```bash
# Probar script de actualización
node scripts/update-bcv-daily.js
```

### Ver Logs
```bash
# Ver logs de actualización
tail -f logs/bcv-update.log
```

## Ventajas del Nuevo Sistema

1. **✅ Más confiable**: Script independiente sin limitaciones de navegador
2. **✅ Más rápido**: Aplicación solo consulta BD local
3. **✅ Sin errores CORS**: No depende de proxies del navegador
4. **✅ Actualización automática**: Tasa siempre actualizada
5. **✅ Sin tasas inventadas**: Solo tasas reales del BCV
6. **✅ Entrada manual**: Si falla la automática, permite entrada manual

## Estructura de Archivos

```
scripts/
├── update-bcv-daily.js      # Script de actualización diaria
├── setup-bcv-automation.sh  # Configuración de automatización
└── logs/
    └── bcv-update.log       # Logs de actualización

src/services/
└── bcvService.js            # Servicio simplificado (solo BD)
```

## Cronograma de Actualización

- **Hora**: 8:00 AM (configurable)
- **Frecuencia**: Diario
- **Zona horaria**: Local del servidor
- **Logs**: Guardados en `logs/bcv-update.log`

## Monitoreo

### Verificar Estado
```bash
# Ver cron jobs activos
crontab -l

# Ver última actualización
tail -20 logs/bcv-update.log
```

### Remover Automatización
```bash
# Remover cron job
crontab -l | grep -v 'update-bcv-daily.js' | crontab -
```

## Troubleshooting

### Si el script falla
1. Verificar credenciales de Supabase en `.env`
2. Verificar conexión a internet
3. Revisar logs en `logs/bcv-update.log`

### Si la aplicación no encuentra tasa
1. Verificar que el script diario se ejecutó
2. Verificar que existe tasa para hoy en BD
3. Usar entrada manual como fallback

## Base de Datos

### Tabla: `tasa_cambio`
- `id`: Primary key
- `fecha`: Fecha en formato YYYY-MM-DD
- `tasa_bcv`: Tasa de cambio en Bs/USD
- `created_at`: Timestamp de creación
- `updated_at`: Timestamp de actualización

### Constraint único
- `fecha`: Solo una tasa por día
- Si existe → actualiza
- Si no existe → inserta
