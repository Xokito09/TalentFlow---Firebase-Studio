import * as admin from 'firebase-admin';

// Prefer the server-side environment variable, then fall back to the public one.
const bucketName =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!bucketName) {
  throw new Error(
    'Firebase Storage bucket name not found. Please set the FIREBASE_STORAGE_BUCKET environment variable for server-side operations.'
  );
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    storageBucket: bucketName,
  });
}

const db = admin.firestore();

/**
 * Returns the default Firebase Storage bucket for the project.
 * @returns {admin.storage.Bucket}
 */
export function getBucket(): admin.storage.Bucket {
  // Calling bucket() without a name returns the default bucket configured during init.
  // To be explicit and avoid ambiguity, we pass the configured bucket name.
  return admin.storage().bucket(bucketName);
}

// For existing imports that use `bucket` directly.
const bucket = getBucket();

export { db, bucket };
