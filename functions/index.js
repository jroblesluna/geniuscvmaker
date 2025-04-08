import { scheduler } from 'firebase-functions';
import cronTask from './cronTask.js';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const cronTaskFunction = scheduler.onSchedule('* * * * *', async (event) => {
  try {
    const lockDoc = await db.collection('cronLocks').doc('taskLock').get();
    if (lockDoc.exists && lockDoc.data().locked) {
      console.log('Task is already running. Skipping...');
      return; // Si el cron está bloqueado, no ejecutamos otra instancia
    }
    // Si no está bloqueado, bloqueamos la ejecución
    await db.collection('cronLocks').doc('taskLock').set({ locked: true });

    // Ejecutamos la tarea
    console.log('Executing cron task...');
    await cronTask();

    // Al finalizar la tarea, desbloqueamos
    await db.collection('cronLocks').doc('taskLock').set({ locked: false });
    console.log('Cron task completed successfully.');
  } catch (error) {
    console.error('Error executing cron task:', error);
    await db.collection('cronLocks').doc('taskLock').set({ locked: false });
  }
});
