import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";
import admin from 'firebase-admin';
import * as fireorm from 'fireorm';

dotenv.config();

// Configuración mejorada para Firebase
interface FirebaseConfig {
  type: string;
  project_id: string;
  private_key_id?: string;
  private_key: string;
  client_email: string;
  client_id?: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

// Función para validar variables de entorno requeridas
function validateEnvironmentVariables(): boolean {
  const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Variables de entorno faltantes: ${missingVars.join(', ')}`);
    return false;
  }
  return true;
}

// Función para crear configuración desde variables de entorno
function createConfigFromEnv(): FirebaseConfig {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n');
  
  return {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID!,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL!,
    client_id: process.env.FIREBASE_CLIENT_ID || "",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
  };
}

// Función para cargar configuración desde archivo
function loadConfigFromFile(): FirebaseConfig {
  const serviceAccountPath = path.resolve(__dirname, "../../serviceAccountKey.json");
  
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error("No se encontró el archivo serviceAccountKey.json");
  }
  
  try {
    const fileContent = fs.readFileSync(serviceAccountPath, "utf8");
    return JSON.parse(fileContent) as FirebaseConfig;
  } catch (error) {
    throw new Error(`Error al leer el archivo de credenciales: ${error}`);
  }
}

// Inicialización de Firebase con manejo de errores mejorado
let serviceAccountKey: FirebaseConfig;
let isProduction = process.env.NODE_ENV === 'production';

// Declarar variables para exportar
let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

try {
  // Priorizar variables de entorno en producción
  if (isProduction && validateEnvironmentVariables()) {
    console.log('🔧 Configurando Firebase con variables de entorno (producción)');
    serviceAccountKey = createConfigFromEnv();
  } else if (!isProduction && fs.existsSync(path.resolve(__dirname, "../../serviceAccountKey.json"))) {
    console.log('🔧 Configurando Firebase con archivo local (desarrollo)');
    serviceAccountKey = loadConfigFromFile();
  } else if (validateEnvironmentVariables()) {
    console.log('🔧 Configurando Firebase con variables de entorno (fallback)');
    serviceAccountKey = createConfigFromEnv();
  } else {
    throw new Error(`
❌ No se pudo configurar Firebase. Verifica que tengas:

Para DESARROLLO:
- Archivo serviceAccountKey.json en la raíz del proyecto

Para PRODUCCIÓN:
- Variables de entorno configuradas:
  • FIREBASE_PROJECT_ID
  • FIREBASE_PRIVATE_KEY  
  • FIREBASE_CLIENT_EMAIL
  • FIREBASE_PRIVATE_KEY_ID (opcional)
  • FIREBASE_CLIENT_ID (opcional)
    `);
  }

  // Inicializar Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey as any),
      projectId: serviceAccountKey.project_id
    });
    console.log(`✅ Firebase Admin inicializado para proyecto: ${serviceAccountKey.project_id}`);
  }

  // Inicializar Firestore y FireORM
  db = admin.firestore();
  
  // Configurar Firestore para producción
  if (isProduction) {
    db.settings({
      ignoreUndefinedProperties: true
    });
  }
  
  fireorm.initialize(db);
  console.log('✅ Firestore y FireORM inicializados correctamente');

  auth = admin.auth();

} catch (error) {
  console.error('❌ Error al inicializar Firebase:', error);
  process.exit(1);
}

// Exportar instancias (después de la inicialización)
export { admin, db, auth };