"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOrphanedUsers = exports.deleteAuthUserOnDocDelete = exports.deleteUserDocOnAuthDelete = exports.migrateCoachLocation = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions");
// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();
// Importar función de migración
var migrate_coach_location_1 = require("./migrate-coach-location");
Object.defineProperty(exports, "migrateCoachLocation", { enumerable: true, get: function () { return migrate_coach_location_1.migrateCoachLocation; } });
/**
 * Cloud Function que se ejecuta cuando un usuario se elimina de Authentication
 * Automáticamente elimina el documento correspondiente en Firestore
 */
exports.deleteUserDocOnAuthDelete = functions.auth.user().onDelete(async (user) => {
    const uid = user.uid;
    const email = user.email;
    try {
        functions.logger.info(`🗑️ Buscando documento de Firestore con authUid: ${uid} (${email})`);
        // Buscar el documento cuyo campo authUid coincida con el UID eliminado
        const userQuery = await db.collection('users').where('authUid', '==', uid).get();
        if (userQuery.empty) {
            functions.logger.info(`ℹ️ No se encontró documento de usuario con authUid: ${uid}`);
            return;
        }
        // Eliminar todos los documentos encontrados (debería ser solo uno)
        for (const doc of userQuery.docs) {
            await doc.ref.delete();
            functions.logger.info(`✅ Documento eliminado exitosamente de Firestore: ${doc.id}`);
        }
    }
    catch (error) {
        functions.logger.error(`❌ Error eliminando documento de Firestore para usuario ${uid}:`, error);
        throw error;
    }
});
/**
 * Cloud Function que se ejecuta cuando un documento de usuario se elimina de Firestore
 * Automáticamente elimina el usuario correspondiente de Authentication
 */
exports.deleteAuthUserOnDocDelete = functions.firestore
    .document('users/{userId}')
    .onDelete(async (snap, context) => {
    const userId = context.params.userId;
    // const deletedData = snap.data() // Datos del documento eliminado (disponible si necesitas)
    try {
        functions.logger.info(`🗑️ Eliminando usuario de Authentication: ${userId}`);
        // Verificar si el usuario aún existe en Authentication
        try {
            await auth.getUser(userId);
            // Si llegamos hasta aquí, el usuario existe y debemos eliminarlo
            await auth.deleteUser(userId);
            functions.logger.info(`✅ Usuario eliminado exitosamente de Authentication: ${userId}`);
        }
        catch (authError) {
            if (authError.code === 'auth/user-not-found') {
                functions.logger.info(`ℹ️ Usuario ${userId} ya no existe en Authentication`);
            }
            else {
                throw authError; // Re-throw otros errores
            }
        }
    }
    catch (error) {
        functions.logger.error(`❌ Error eliminando usuario de Authentication ${userId}:`, error);
        throw error;
    }
});
/**
 * Función auxiliar para eliminar datos relacionados del usuario
 * Esta función se puede expandir según las necesidades de tu app
 * DESCOMENTA ESTA FUNCIÓN SI QUIERES ELIMINAR DATOS RELACIONADOS
 */
/*
async function deleteRelatedUserData(uid: string) {
  const batch = db.batch()
  
  try {
    // Ejemplo: Eliminar workouts del usuario
    const workoutsQuery = await db.collection('workouts')
      .where('userId', '==', uid)
      .get()
    
    workoutsQuery.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    // Ejemplo: Eliminar progreso del usuario
    const progressQuery = await db.collection('progress')
      .where('userId', '==', uid)
      .get()
    
    progressQuery.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    // Ejecutar todas las eliminaciones en batch
    await batch.commit()
    
    functions.logger.info(`🧹 Datos relacionados eliminados para usuario: ${uid}`)
    
  } catch (error) {
    functions.logger.error(`❌ Error eliminando datos relacionados para usuario ${uid}:`, error)
    // No re-throw aquí para que no bloquee la eliminación principal
  }
}
*/
/**
 * Cloud Function HTTP para limpieza manual de usuarios huérfanos
 * Útil para limpiar inconsistencias existentes
 * Llama con: POST https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/cleanupOrphanedUsers
 */
exports.cleanupOrphanedUsers = functions.https.onCall(async (data, context) => {
    try {
        functions.logger.info('🧹 Iniciando limpieza de usuarios huérfanos...');
        // Obtener todos los usuarios de Authentication
        const authUsers = await auth.listUsers();
        const authUids = new Set(authUsers.users.map(user => user.uid));
        // Obtener todos los documentos de usuarios en Firestore
        const firestoreUsers = await db.collection('users').get();
        const orphanedDocs = [];
        // Identificar documentos huérfanos en Firestore
        firestoreUsers.docs.forEach(doc => {
            if (!authUids.has(doc.id)) {
                orphanedDocs.push(doc.id);
            }
        });
        // Eliminar documentos huérfanos
        if (orphanedDocs.length > 0) {
            const batch = db.batch();
            orphanedDocs.forEach(uid => {
                batch.delete(db.collection('users').doc(uid));
            });
            await batch.commit();
            functions.logger.info(`🗑️ Eliminados ${orphanedDocs.length} documentos huérfanos de Firestore`);
        }
        else {
            functions.logger.info('✅ No se encontraron documentos huérfanos');
        }
        return { success: true, orphanedDocsDeleted: orphanedDocs.length };
    }
    catch (error) {
        functions.logger.error('❌ Error en limpieza de usuarios huérfanos:', error);
        throw error;
    }
});
//# sourceMappingURL=index.js.map