const admin = require('firebase-admin');
const serviceAccount = require('./therepvana-firebase-adminsdk-fbsvc-456d3c317c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const coachUid = 'coach_jorgeXXXXX'; // Pon aquí el UID real del coach

async function assignCoachToAllClients() {
  const clientsSnapshot = await db.collection('users').where('role', '==', 'client').get();
  for (const doc of clientsSnapshot.docs) {
    await db.collection('users').doc(doc.id).update({
      coachId: coachUid
    });
    console.log(`Asignado coachId a ${doc.id}`);
  }
  console.log('¡Listo!');
  process.exit(0);
}

assignCoachToAllClients();
