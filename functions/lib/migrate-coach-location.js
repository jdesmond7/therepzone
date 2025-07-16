"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateCoachLocation = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Mapping de hometown a country, state, city
const locationMapping = {
    'Monterrey': { country: 'México', state: 'Nuevo León', city: 'Monterrey' },
    'Guadalajara': { country: 'México', state: 'Jalisco', city: 'Guadalajara' },
    'Ciudad de México': { country: 'México', state: 'Ciudad de México', city: 'Ciudad de México' },
    'Puebla': { country: 'México', state: 'Puebla', city: 'Puebla' },
    'Tijuana': { country: 'México', state: 'Baja California', city: 'Tijuana' },
    'Mérida': { country: 'México', state: 'Yucatán', city: 'Mérida' },
    'Cancún': { country: 'México', state: 'Quintana Roo', city: 'Cancún' },
    'Querétaro': { country: 'México', state: 'Querétaro', city: 'Querétaro' },
    'León': { country: 'México', state: 'Guanajuato', city: 'León' },
    'San Luis Potosí': { country: 'México', state: 'San Luis Potosí', city: 'San Luis Potosí' },
    'Aguascalientes': { country: 'México', state: 'Aguascalientes', city: 'Aguascalientes' },
    'Saltillo': { country: 'México', state: 'Coahuila', city: 'Saltillo' },
    'Torreón': { country: 'México', state: 'Coahuila', city: 'Torreón' },
    'Chihuahua': { country: 'México', state: 'Chihuahua', city: 'Chihuahua' },
    'Hermosillo': { country: 'México', state: 'Sonora', city: 'Hermosillo' },
    'Culiacán': { country: 'México', state: 'Sinaloa', city: 'Culiacán' },
    'Mazatlán': { country: 'México', state: 'Sinaloa', city: 'Mazatlán' },
    'Durango': { country: 'México', state: 'Durango', city: 'Durango' },
    'Zacatecas': { country: 'México', state: 'Zacatecas', city: 'Zacatecas' },
    'Tepic': { country: 'México', state: 'Nayarit', city: 'Tepic' },
    'Colima': { country: 'México', state: 'Colima', city: 'Colima' },
    'Morelia': { country: 'México', state: 'Michoacán', city: 'Morelia' },
    'Toluca': { country: 'México', state: 'México', city: 'Toluca' },
    'Cuernavaca': { country: 'México', state: 'Morelos', city: 'Cuernavaca' },
    'Acapulco': { country: 'México', state: 'Guerrero', city: 'Acapulco' },
    'Oaxaca': { country: 'México', state: 'Oaxaca', city: 'Oaxaca' },
    'Villahermosa': { country: 'México', state: 'Tabasco', city: 'Villahermosa' },
    'Tuxtla Gutiérrez': { country: 'México', state: 'Chiapas', city: 'Tuxtla Gutiérrez' },
    'Campeche': { country: 'México', state: 'Campeche', city: 'Campeche' },
    'Chetumal': { country: 'México', state: 'Quintana Roo', city: 'Chetumal' },
    'La Paz': { country: 'México', state: 'Baja California Sur', city: 'La Paz' },
    'Mexicali': { country: 'México', state: 'Baja California', city: 'Mexicali' },
    'Ensenada': { country: 'México', state: 'Baja California', city: 'Ensenada' },
    'Tecate': { country: 'México', state: 'Baja California', city: 'Tecate' }
};
exports.migrateCoachLocation = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado');
    }
    // Verificar si es admin (opcional)
    const user = context.auth;
    console.log(`Usuario autenticado: ${user.uid}`);
    try {
        const db = admin.firestore();
        console.log('🚀 Iniciando migración de campos de ubicación...');
        // Obtener todos los coaches
        const coachesSnapshot = await db.collection('coaches').get();
        console.log(`📈 Encontrados ${coachesSnapshot.size} coaches`);
        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        // Usar batch writes para mejor rendimiento
        const batch = db.batch();
        let batchCount = 0;
        const BATCH_SIZE = 500;
        // Procesar cada coach
        for (const coachDoc of coachesSnapshot.docs) {
            const coachId = coachDoc.id;
            const coachData = coachDoc.data();
            const coachName = coachData.fullName || coachData.firstName || coachData.nickname || coachId;
            console.log(`🔍 Procesando coach: ${coachName} (${coachId})`);
            // Verificar si ya tiene los nuevos campos y no tiene hometown
            if (coachData.city && coachData.country && coachData.state && !coachData.hometown) {
                console.log('⏭️  Ya tiene campos de ubicación nuevos, saltando...');
                skippedCount++;
                continue;
            }
            // Obtener valor de hometown
            const hometown = coachData.hometown;
            console.log(`📍 Hometown actual: "${hometown}"`);
            let updateData = {};
            if (!hometown) {
                console.log('⚠️  No tiene hometown, estableciendo valores por defecto...');
                updateData = {
                    country: 'México',
                    state: '',
                    city: '',
                    hometown: null
                };
            }
            else {
                // Buscar mapping para hometown
                const location = locationMapping[hometown];
                if (location) {
                    updateData = {
                        country: location.country,
                        state: location.state,
                        city: location.city,
                        hometown: null
                    };
                    console.log(`✅ Mapeado: ${hometown} → ${location.country}, ${location.state}, ${location.city}`);
                }
                else {
                    console.log(`⚠️  Hometown no encontrado en mapping: "${hometown}", estableciendo valores por defecto...`);
                    updateData = {
                        country: 'México',
                        state: '',
                        city: hometown,
                        hometown: null
                    };
                }
            }
            // Agregar a batch
            const coachRef = db.collection('coaches').doc(coachId);
            batch.update(coachRef, updateData);
            batchCount++;
            // Commit batch si alcanza el límite
            if (batchCount >= BATCH_SIZE) {
                console.log(`💾 Commitando lote de ${batchCount} actualizaciones...`);
                await batch.commit();
                updatedCount += batchCount;
                batchCount = 0;
            }
        }
        // Commit actualizaciones restantes
        if (batchCount > 0) {
            console.log(`💾 Commitando lote final de ${batchCount} actualizaciones...`);
            await batch.commit();
            updatedCount += batchCount;
        }
        const result = {
            success: true,
            totalCoaches: coachesSnapshot.size,
            updatedCount,
            skippedCount,
            errorCount,
            message: 'Migración completada exitosamente'
        };
        console.log('🎉 Migración completada!', result);
        return result;
    }
    catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw new functions.https.HttpsError('internal', 'Error durante la migración', error);
    }
});
//# sourceMappingURL=migrate-coach-location.js.map