# 🔥 Configuración de Firebase - Guía Completa

## 📋 **Variables de Entorno Requeridas**

### **Variables Obligatorias:**
```bash
FIREBASE_PROJECT_ID=sistema-reservas-cef1a
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[tu-clave-privada]\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@sistema-reservas-cef1a.iam.gserviceaccount.com
```

### **Variables Opcionales:**
```bash
FIREBASE_PRIVATE_KEY_ID=tu-private-key-id
FIREBASE_CLIENT_ID=tu-client-id
NODE_ENV=production
```

## 🛠️ **Configuración por Entorno**

### **Desarrollo Local:**
1. Descarga `serviceAccountKey.json` desde Firebase Console
2. Colócalo en la raíz del proyecto
3. El sistema lo detectará automáticamente

### **Producción (Render/Heroku/etc):**
1. Configura las variables de entorno en tu plataforma
2. El sistema usará las variables automáticamente
3. No necesitas subir el archivo JSON

## 🔑 **Cómo Obtener las Credenciales**

### **Paso 1: Firebase Console**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `sistema-reservas-cef1a`
3. Ve a **Configuración del proyecto** (⚙️)

### **Paso 2: Cuentas de Servicio**
1. Haz clic en **"Cuentas de servicio"**
2. Haz clic en **"Generar nueva clave privada"**
3. Descarga el archivo JSON

### **Paso 3: Extraer Valores**
Del archivo JSON descargado, copia estos valores:

```json
{
  "type": "service_account",
  "project_id": "sistema-reservas-cef1a",
  "private_key_id": "COPIAR_ESTE_VALOR",
  "private_key": "-----BEGIN PRIVATE KEY-----\nCOPIAR_ESTA_CLAVE_COMPLETA\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@sistema-reservas-cef1a.iam.gserviceaccount.com",
  "client_id": "COPIAR_ESTE_VALOR"
}
```

## 🚀 **Configuración en Render**

### **Environment Variables:**
```
FIREBASE_PROJECT_ID = sistema-reservas-cef1a
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-xxxxx@sistema-reservas-cef1a.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\n[clave-completa]\n-----END PRIVATE KEY-----\n
FIREBASE_PRIVATE_KEY_ID = [id-de-la-clave]
FIREBASE_CLIENT_ID = [id-del-cliente]
NODE_ENV = production
```

### **Build & Start Commands:**
```
Build Command: npm install
Start Command: npm start
```

## 🔧 **Mejoras Implementadas**

### ✅ **Validación Automática**
- Verifica variables de entorno requeridas
- Detecta automáticamente el entorno (desarrollo/producción)
- Mensajes de error claros y específicos

### ✅ **Configuración Híbrida**
- Desarrollo: Usa archivo `serviceAccountKey.json`
- Producción: Usa variables de entorno
- Fallback automático si falta algún método

### ✅ **Manejo de Errores Mejorado**
- Mensajes descriptivos con emojis
- Logs detallados del proceso de inicialización
- Exit code 1 en caso de error crítico

### ✅ **Optimizaciones de Producción**
- Configuración específica para Firestore en producción
- Logs estructurados para monitoreo
- Validación de credenciales antes de inicializar

## 🚨 **Solución de Problemas**

### **Error: "Variables de entorno faltantes"**
```bash
# Verifica que tengas estas variables configuradas:
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_CLIENT_EMAIL
echo $FIREBASE_PRIVATE_KEY
```

### **Error: "No se encontró el archivo de credenciales"**
```bash
# Para desarrollo local, asegúrate de tener:
ls -la serviceAccountKey.json
```

### **Error: "Firebase Admin ya inicializado"**
```bash
# Esto es normal, significa que ya está configurado correctamente
```

## 📊 **Logs de Inicialización**

### **Desarrollo:**
```
🔧 Configurando Firebase con archivo local (desarrollo)
✅ Firebase Admin inicializado para proyecto: sistema-reservas-cef1a
✅ Firestore y FireORM inicializados correctamente
```

### **Producción:**
```
🔧 Configurando Firebase con variables de entorno (producción)
✅ Firebase Admin inicializado para proyecto: sistema-reservas-cef1a
✅ Firestore y FireORM inicializados correctamente
```

## 🔐 **Seguridad**

### ✅ **Buenas Prácticas:**
- ❌ **NUNCA** subas `serviceAccountKey.json` a GitHub
- ✅ **SIEMPRE** usa variables de entorno en producción
- ✅ **ROTA** las claves regularmente
- ✅ **MONITOREA** el uso de la API

### ✅ **Archivos a Ignorar:**
```gitignore
# Firebase
serviceAccountKey.json
*.firebase-adminsdk-*.json

# Environment
.env
.env.local
.env.production
```

## 🎯 **Próximos Pasos**

1. ✅ Configura las variables de entorno en Render
2. ✅ Haz redeploy de tu aplicación
3. ✅ Verifica los logs de inicialización
4. ✅ Prueba la conexión con Firebase

¡Tu aplicación debería estar funcionando perfectamente! 🚀
