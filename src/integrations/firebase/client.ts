// src/integrations/firebase/client.ts
// Placeholder Firebase client for the front‑end only repository.
// Replace the `firebaseConfig` object with your project's real configuration.
// This file exports the Firebase auth instance and helper functions used by the
// login page (`signInWithEmailAndPassword` and `createUserWithEmailAndPassword`).

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword as firebaseSignIn, createUserWithEmailAndPassword as firebaseCreateUser } from "firebase/auth";

// -----------------------------------------------------------------------------
// TODO: Paste your Firebase project's config object below.
// Example:
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID",
// };
// -----------------------------------------------------------------------------
const firebaseConfig = {} as Record<string, string>;

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);

export const signInWithEmailAndPassword = firebaseSignIn;
export const createUserWithEmailAndPassword = firebaseCreateUser;
