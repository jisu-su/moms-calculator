import { getApps, getApp, initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getFirestore } from "firebase/firestore";

// Firebase 설정은 EXPO_PUBLIC_ 환경변수에서 가져온다.
// 민감한 값은 .env에만 두고, 앱에서는 직접 하드코딩하지 않는다.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

// 앱이 여러 번 초기화되지 않도록 가드한다.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// auth는 compat 방식으로 사용 (RN에서 안정적으로 동작)
// DB는 기존 modular 방식 유지
const compatApp =
  firebase.apps.length > 0 ? firebase.app() : firebase.initializeApp(firebaseConfig);

export const auth = compatApp.auth();
export const db = getFirestore(app);
