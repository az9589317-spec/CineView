// IMPORTANT: This file is only used for server-side Firebase operations.
// It uses the Firebase Admin SDK, which has different initialization and
// authentication mechanisms than the client-side SDK.

import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
import { firebaseConfig } from './config';

let serverApp: App | null = null;
const adminAppName = 'firebase-admin-app-instance';

export async function initializeServerApp(): Promise<App> {
  // Check if our specific admin app instance already exists
  const existingApp = getApps().find(app => app.name === adminAppName);
  if (existingApp) {
    return existingApp;
  }

  // If you have a service account JSON file, you would use:
  // const serviceAccount = require('./path/to/serviceAccountKey.json');
  // serverApp = initializeApp({ credential: cert(serviceAccount), ... }, adminAppName);

  // In environments like Google Cloud Run or Cloud Functions, the SDK can
  // often auto-discover credentials. If not, you must provide them.
  // For local development or other environments, you might need to set
  // the GOOGLE_APPLICATION_CREDENTIALS environment variable.
  try {
    serverApp = initializeApp({
      projectId: firebaseConfig.projectId,
    }, adminAppName);
  } catch (error: any) {
     if (error.code === 'app/duplicate-app') {
        serverApp = getApp(adminAppName);
     } else {
        console.error("Firebase Admin initialization failed:", error);
        // In a real app, you might want to throw this error
        // or handle it more gracefully.
        throw error;
     }
  }

  return serverApp;
}
