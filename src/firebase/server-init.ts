// IMPORTANT: This file is only used for server-side Firebase operations.
// It uses the Firebase Admin SDK, which has different initialization and
// authentication mechanisms than the client-side SDK.

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

const adminAppName = 'firebase-admin-app-instance';

/**
 * Initializes and returns the Firebase Admin App and Firestore instances for server-side use.
 * This function ensures that the Admin app is initialized only once.
 */
export function initializeServerApp() {
  const existingApp = getApps().find(app => app.name === adminAppName);
  if (existingApp) {
    return {
      adminApp: existingApp,
      firestore: getFirestore(existingApp),
    };
  }

  try {
    const app = initializeApp({
        projectId: firebaseConfig.projectId,
      },
      adminAppName
    );
    
    return {
        adminApp: app,
        firestore: getFirestore(app)
    };
  } catch (error) {
    // This can happen in some hot-reload scenarios if the check above fails.
    if (error instanceof Error && 'code' in error && (error as any).code === 'app/duplicate-app') {
      const app = getApps().find(app => app.name === adminAppName)!;
      return {
        adminApp: app,
        firestore: getFirestore(app)
      };
    }
    console.error("Critical: Firebase Admin SDK initialization failed.", error);
    throw error;
  }
}
