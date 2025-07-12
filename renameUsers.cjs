// renameUsers.cjs
const admin = require('firebase-admin');
const serviceAccount = require('./therepvana-firebase-adminsdk-fbsvc-456d3c317c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function renameUsersAndCoaches() {
  const usersSnapshot = await db.collection('users').get();

  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    const oldUid = doc.id;
    const firstName = (data.firstName || data.fullName?.split(' ')[0] || 'user').toLowerCase();
    const last5 = oldUid.slice(-5);

    let newUid;
    if (data.role === 'coach') {
      newUid = `coach_${firstName}${last5}`;
    } else if (data.role === 'client') {
      newUid = `client_${firstName}${last5}`;
    } else {
      continue; // skip admins or unknown roles
    }

    // Si el UID ya es correcto, saltar
    if (oldUid === newUid) continue;

    // Copiar datos al nuevo documento
    await db.collection('users').doc(newUid).set({
      ...data
    });

    // Eliminar el documento viejo
    await db.collection('users').doc(oldUid).delete();

    console.log(`Renombrado: ${oldUid} -> ${newUid}`);
  }

  // Actualizar coachId en los clientes
  const clientsSnapshot = await db.collection('users').where('role', '==', 'client').get();
  for (const doc of clientsSnapshot.docs) {
    const data = doc.data();
    if (data.coachId) {
      // Busca el documento del coach original
      const coachDoc = await db.collection('users').doc(data.coachId).get();
      let coachFirstName = 'coach';
      if (coachDoc.exists) {
        const coachData = coachDoc.data();
        coachFirstName = (coachData.firstName || coachData.fullName?.split(' ')[0] || 'coach').toLowerCase();
      }
      const coachLast5 = data.coachId.slice(-5);
      const newCoachId = `coach_${coachFirstName}${coachLast5}`;
      await db.collection('users').doc(doc.id).update({
        coachId: newCoachId
      });
      console.log(`Actualizado coachId para ${doc.id}: ${data.coachId} -> ${newCoachId}`);
    }
  }
}

renameUsersAndCoaches().then(() => {
  console.log('¡Listo!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
