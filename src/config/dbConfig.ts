import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";
import admin from 'firebase-admin';
import * as fireorm from 'fireorm';

dotenv.config();

const keyRelativePath = process.env.FIREBASE_CREDENTIALS_PATH || "serviceAccountKey.json";
if (!keyRelativePath) {
  throw new Error("No se encontró la ruta de las credenciales de Firebase Admin");
}

const serviceAccountPath = path.resolve(__dirname, "../../serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
    throw new Error("No se encontró el archivo de credenciales Firebase Admin");
  }

const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if(!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey)
        
    });
}

const db = admin.firestore();
fireorm.initialize(db);
console.log(' ✔ Base de datos inicializada.')

const auth = admin.auth();

export { admin, db, auth };