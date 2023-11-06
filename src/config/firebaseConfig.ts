import fs from 'fs';

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';

function getFirebaseAdminForProject(projectId: string) {
  if (!projectId) throw new Error('Project ID is required!');

  let projectApp = getApps().find((app: App) => app.name === projectId);

  if (projectApp) return projectApp;

  // if here, project is not yet initialized
  let serviceAccountPath =
    process.env.FIREBASE_ACCOUNT_SERVICE_PATH != null
      ? `${process.env.FIREBASE_ACCOUNT_SERVICE_PATH}\\${projectId}.json`
      : `C:\\EscolarManager\\Dados\\AppsCred\\${projectId}.json`;

  // Check if the file exists and is a valid JSON file
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Service account file not found: ${serviceAccountPath}`);
  }

  // Initialize the Firebase Admin SDK
  const serviceAccount = require(serviceAccountPath);

  return initializeApp(
    {
      credential: cert(serviceAccount),
      databaseURL: `https://${projectId}.firebaseio.com`,
    },
    projectId
  ); // <-- using projectId as instance name
}

const serviceAccountPath =
  process.env.FIREBASE_ACCOUNT_SERVICE_PATH ||
  'C:\\EscolarManager\\Dados\\AppsCred\\';

export { getFirebaseAdminForProject, serviceAccountPath };
