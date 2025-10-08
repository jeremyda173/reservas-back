import * as fs from 'fs';
import * as path from 'path';

/**
 * Utilidad para validar la configuración de Firebase
 */
export class FirebaseValidator {
  
  /**
   * Valida si la configuración de Firebase está correcta
   */
  static validateConfiguration(): { isValid: boolean; message: string; details: any } {
    const isProduction = process.env.NODE_ENV === 'production';
    const hasEnvVars = this.hasEnvironmentVariables();
    const hasLocalFile = this.hasLocalServiceAccountFile();
    
    const result = {
      isValid: false,
      message: '',
      details: {
        environment: isProduction ? 'production' : 'development',
        hasEnvironmentVariables: hasEnvVars,
        hasLocalFile: hasLocalFile,
        requiredVars: this.getRequiredEnvironmentVariables(),
        missingVars: this.getMissingEnvironmentVariables()
      }
    };

    if (isProduction) {
      if (hasEnvVars) {
        result.isValid = true;
        result.message = '✅ Configuración de producción válida (variables de entorno)';
      } else {
        result.isValid = false;
        result.message = '❌ Variables de entorno faltantes para producción';
      }
    } else {
      if (hasLocalFile || hasEnvVars) {
        result.isValid = true;
        result.message = hasLocalFile 
          ? '✅ Configuración de desarrollo válida (archivo local)'
          : '✅ Configuración de desarrollo válida (variables de entorno)';
      } else {
        result.isValid = false;
        result.message = '❌ No se encontró configuración válida para desarrollo';
      }
    }

    return result;
  }

  /**
   * Verifica si existen las variables de entorno requeridas
   */
  private static hasEnvironmentVariables(): boolean {
    const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
    return requiredVars.every(varName => !!process.env[varName]);
  }

  /**
   * Verifica si existe el archivo de service account local
   */
  private static hasLocalServiceAccountFile(): boolean {
    const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
    return fs.existsSync(serviceAccountPath);
  }

  /**
   * Obtiene las variables de entorno requeridas
   */
  private static getRequiredEnvironmentVariables(): string[] {
    return ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
  }

  /**
   * Obtiene las variables de entorno faltantes
   */
  private static getMissingEnvironmentVariables(): string[] {
    const requiredVars = this.getRequiredEnvironmentVariables();
    return requiredVars.filter(varName => !process.env[varName]);
  }

  /**
   * Valida la estructura de la clave privada
   */
  static validatePrivateKey(privateKey: string): { isValid: boolean; message: string } {
    if (!privateKey) {
      return { isValid: false, message: '❌ Clave privada vacía' };
    }

    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      return { isValid: false, message: '❌ Formato de clave privada inválido' };
    }

    if (!privateKey.includes('-----END PRIVATE KEY-----')) {
      return { isValid: false, message: '❌ Clave privada incompleta' };
    }

    return { isValid: true, message: '✅ Formato de clave privada válido' };
  }

  /**
   * Valida el formato del email de la service account
   */
  static validateClientEmail(email: string): { isValid: boolean; message: string } {
    if (!email) {
      return { isValid: false, message: '❌ Email de service account vacío' };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: '❌ Formato de email inválido' };
    }

    if (!email.includes('@') || !email.includes('.iam.gserviceaccount.com')) {
      return { isValid: false, message: '❌ Email no parece ser de service account de Firebase' };
    }

    return { isValid: true, message: '✅ Formato de email válido' };
  }

  /**
   * Genera un reporte completo de la configuración
   */
  static generateReport(): string {
    const validation = this.validateConfiguration();
    const privateKeyValidation = process.env.FIREBASE_PRIVATE_KEY 
      ? this.validatePrivateKey(process.env.FIREBASE_PRIVATE_KEY)
      : { isValid: false, message: '❌ Clave privada no configurada' };
    
    const emailValidation = process.env.FIREBASE_CLIENT_EMAIL
      ? this.validateClientEmail(process.env.FIREBASE_CLIENT_EMAIL)
      : { isValid: false, message: '❌ Email no configurado' };

    return `
🔥 REPORTE DE CONFIGURACIÓN FIREBASE
====================================

${validation.message}
${privateKeyValidation.message}
${emailValidation.message}

📊 DETALLES:
- Entorno: ${validation.details.environment}
- Variables de entorno: ${validation.details.hasEnvironmentVariables ? '✅' : '❌'}
- Archivo local: ${validation.details.hasLocalFile ? '✅' : '❌'}
- Variables faltantes: ${validation.details.missingVars.length > 0 ? validation.details.missingVars.join(', ') : 'Ninguna'}

🔧 CONFIGURACIÓN ACTUAL:
- FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? '✅ Configurado' : '❌ Faltante'}
- FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? '✅ Configurado' : '❌ Faltante'}
- FIREBASE_PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? '✅ Configurado' : '❌ Faltante'}

${validation.isValid ? '🚀 LISTO PARA USAR' : '⚠️ REQUIERE CONFIGURACIÓN'}
====================================
    `;
  }
}

// Función helper para usar en desarrollo
export function validateFirebaseConfig(): void {
  const report = FirebaseValidator.generateReport();
  console.log(report);
  
  const validation = FirebaseValidator.validateConfiguration();
  if (!validation.isValid) {
    console.error('\n❌ Configuración de Firebase inválida. Revisa los detalles arriba.');
    process.exit(1);
  }
}
