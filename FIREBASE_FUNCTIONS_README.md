# Firebase Functions - Sincronización de Usuarios

Esta configuración implementa Cloud Functions para Firebase que mantienen sincronizados los datos de usuarios entre Firebase Authentication y Firestore.

## 🎯 Funcionalidades

### 1. **Sincronización Bidireccional Automática**
- **`deleteUserDocOnAuthDelete`**: Cuando se elimina un usuario de Authentication → elimina automáticamente el documento en Firestore
- **`deleteAuthUserOnDocDelete`**: Cuando se elimina un documento de usuario en Firestore → elimina automáticamente el usuario de Authentication

### 2. **Limpieza Manual de Datos Huérfanos**
- **`cleanupOrphanedUsers`**: Función HTTP callable para limpiar usuarios huérfanos existentes

## 📁 Estructura de Archivos

```
├── firebase.json              # Configuración principal de Firebase
├── firestore.rules           # Reglas de seguridad de Firestore
├── firestore.indexes.json    # Índices de Firestore
└── functions/
    ├── package.json          # Dependencias de Functions
    ├── tsconfig.json         # Configuración TypeScript
    └── src/
        └── index.ts          # Cloud Functions principales
```

## 🛠️ Configuración Inicial

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Autenticarse con Firebase
```bash
firebase login
```

### 3. Inicializar el proyecto (si no está hecho)
```bash
firebase init
```

### 4. Instalar dependencias de Functions
```bash
cd functions
npm install
```

## 🚀 Despliegue

### Desplegar todo
```bash
npm run firebase:deploy
```

### Desplegar solo Functions
```bash
npm run firebase:deploy:functions
```

### Desplegar solo reglas de Firestore
```bash
npm run firebase:deploy:firestore
```

## 🔧 Desarrollo Local

### Ejecutar emuladores
```bash
npm run firebase:emulators
```

Esto iniciará:
- Functions Emulator (puerto 5001)
- Firestore Emulator (puerto 8080)
- Authentication Emulator (puerto 9099)

### Ver logs de Functions
```bash
npm run firebase:logs
```

## 📊 Monitoreo

### Logs en tiempo real
```bash
firebase functions:log --follow
```

### Ver métricas en Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a "Functions" para ver ejecuciones y logs

## 🔒 Seguridad

### Reglas de Firestore Implementadas
- **Usuarios**: Solo pueden acceder a sus propios datos
- **Coaches**: Pueden ver datos de clientes asignados
- **Workouts**: Acceso basado en propiedad y relación coach-cliente
- **Ejercicios**: Lectura pública, escritura solo para admins

### Permisos de Functions
Las Functions ejecutan con permisos de administrador y pueden:
- Eliminar usuarios de Authentication
- Eliminar documentos de Firestore
- Leer todas las colecciones para limpieza

## 🛠️ Funciones Detalladas

### `deleteUserDocOnAuthDelete`
```typescript
// Se ejecuta automáticamente cuando:
firebase.auth().currentUser.delete()
// o desde Admin SDK:
admin.auth().deleteUser(uid)
```

**Flujo:**
1. Usuario se elimina de Authentication
2. Function se dispara automáticamente
3. Elimina documento `/users/{uid}` de Firestore
4. Opcionalmente elimina datos relacionados

### `deleteAuthUserOnDocDelete`
```typescript
// Se ejecuta automáticamente cuando:
admin.firestore().collection('users').doc(uid).delete()
```

**Flujo:**
1. Documento de usuario se elimina de Firestore
2. Function se dispara automáticamente
3. Verifica si usuario existe en Authentication
4. Elimina usuario de Authentication si existe

### `cleanupOrphanedUsers`
```typescript
// Llamar manualmente desde el cliente:
const cleanupFunction = httpsCallable(functions, 'cleanupOrphanedUsers')
const result = await cleanupFunction()
```

**Flujo:**
1. Obtiene todos los usuarios de Authentication
2. Obtiene todos los documentos de Firestore
3. Identifica documentos huérfanos (sin usuario en Auth)
4. Elimina documentos huérfanos

## 🔍 Troubleshooting

### Error: "Function not found"
```bash
# Reconstruir y redesplegar
cd functions
npm run build
firebase deploy --only functions
```

### Error: "Permission denied"
1. Verificar que el proyecto tiene Functions habilitado
2. Verificar IAM roles en Google Cloud Console
3. Verificar que las reglas de Firestore son correctas

### Error: "Billing account required"
- Firebase Functions requiere plan Blaze (pay-as-you-go)
- Configurar billing en Firebase Console

### Logs no aparecen
```bash
# Ver logs directamente
firebase functions:log --limit 50

# Filtrar por función específica
firebase functions:log --filter "deleteUserDocOnAuthDelete"
```

## 📈 Costos Estimados

### Functions (Plan Blaze)
- **Invocaciones**: 2M gratis/mes, luego $0.40 por 1M
- **Tiempo de ejecución**: 400,000 GB-s gratis/mes
- **Tráfico saliente**: 5GB gratis/mes

### Estimación para THEREPZONE:
- **Eliminaciones de usuarios**: ~10-50/mes = **GRATIS**
- **Limpieza manual**: ~1-2/mes = **GRATIS**
- **Total estimado**: **$0/mes** (muy por debajo de límites gratuitos)

## 🚨 Consideraciones Importantes

### 1. **Eliminaciones en Cascada**
- Las Functions actuales eliminan solo el documento del usuario
- Para eliminar workouts, progreso, etc., descomenta la línea:
  ```typescript
  await deleteRelatedUserData(uid)
  ```

### 2. **Backup antes de Desplegar**
```bash
# Exportar datos antes del primer despliegue
firebase firestore:export gs://tu-bucket/backup-$(date +%Y%m%d)
```

### 3. **Testing**
- Usar emuladores para testing
- Probar en proyecto de desarrollo primero
- Verificar logs después del despliegue

## 📞 Soporte

Para preguntas o problemas:
1. Revisar logs: `firebase functions:log`
2. Verificar Firebase Console
3. Consultar [documentación oficial](https://firebase.google.com/docs/functions)

## 🔄 Actualización de Functions

```bash
# 1. Hacer cambios en functions/src/index.ts
# 2. Reconstruir
cd functions && npm run build

# 3. Redesplegar
firebase deploy --only functions

# 4. Verificar logs
firebase functions:log --limit 10
```

---

✅ **Estado**: Configurado y listo para desplegar
🎯 **Objetivo**: Mantener consistencia entre Authentication y Firestore
🛡️ **Seguridad**: Reglas implementadas y probadas 