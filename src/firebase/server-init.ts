// IMPORTANT: This file is only used for server-side Firebase operations.
// It uses the Firebase Admin SDK, which has different initialization and
// authentication mechanisms than the client-side SDK.

import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

const adminAppName = 'firebase-admin-app-instance';

export async function initializeServerApp() {
  const existingApp = getApps().find(app => app.name === adminAppName);
  if (existingApp) {
    return {
      adminApp: existingApp,
      firestore: getFirestore(existingApp),
    };
  }

  let adminApp: App;
  try {
    // Explicitly providing the projectId helps the SDK locate credentials in some environments.
    adminApp = initializeApp(
      {
        projectId: firebaseConfig.projectId,
      },
      adminAppName
    );
  } catch (error: any) {
    // This case can happen in environments with frequent hot-reloads
    if (error.code === 'app/duplicate-app') {
      const alreadyInitializedApp = getApps().find(app => app.name === adminAppName)!;
      return {
        adminApp: alreadyInitializedApp,
        firestore: getFirestore(alreadyInitializedApp),
      };
    }
    console.error('Firebase Admin initialization failed:', error);
    throw error;
  }

  return {
    adminApp: adminApp,
    firestore: getFirestore(adminApp),
  };
}
