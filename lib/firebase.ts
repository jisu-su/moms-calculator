import { getApps, getApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase 설정은 EXPO_PUBLIC_ 환경변수에서 가져온다.
// Expo Go에서도 바로 사용 가능하며, 민감한 값은 .env에만 둔다.
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

// 인증/DB 인스턴스를 재사용하도록 export 한다.
export const auth = getAuth(app);
export const db = getFirestore(app);
