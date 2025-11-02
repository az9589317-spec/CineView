// IMPORTANT: This file is only used for server-side Firebase operations.
// It uses the Firebase Admin SDK, which has different initialization and
// authentication mechanisms than the client-side SDK.

import { initializeApp, getApps, App } from 'firebase-admin/app';
import { firebaseConfig } from './config';

let serverApp: App | null = null;

export async function initializeServerApp(): Promise<App> {
  if (serverApp) {
    return serverApp;
  }
  
  if (getApps().length > 0) {
     // An app is already initialized, likely on the client.
     // We need a separate admin app. Let's try to get one by name.
     const existingApp = getApps().find(app => app.name === 'firebase-admin-app');
     if(existingApp) {
        serverApp = existingApp;
        return serverApp;
     }
  }

  // No admin app found, so we create a new one.
  // The service account credentials can be automatically discovered
  // in many hosting environments (like Cloud Run, Functions, App Engine),
  // so we don't explicitly pass them.
  serverApp = initializeApp({
    // Using the client-side config is okay for databaseURL and projectId
    // as long as the server has the right IAM permissions via a service account.
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    projectId: firebaseConfig.projectId,
  }, 'firebase-admin-app'); // Give it a unique name to avoid conflicts

  return serverApp;
}
