// src/config/firebase.ts
// 
// INSTRUCCIONES PARA CONFIGURAR FIREBASE:
// 
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un nuevo proyecto o usa uno existente
// 3. Agrega una app Android:
//    - Package name: com.duolovefresh
//    - Descarga google-services.json y colócalo en: android/app/google-services.json
// 
// 4. En Firebase Console, habilita Authentication:
//    - Email/Password
//    - Google Sign-In
//    - Facebook Login
// 
// 5. Para Google Sign-In:
//    - El Web Client ID lo encuentras en google-services.json 
//      en: client > oauth_client > client_type: 3 > client_id
//    - O en Firebase Console > Authentication > Sign-in method > Google > Web SDK configuration
// 
// 6. Para Facebook Login:
//    - Crea una app en https://developers.facebook.com/
//    - Copia el App ID y Client Token
//    - En Firebase Console > Authentication > Sign-in method > Facebook
//      Agrega el App ID y App Secret de Facebook
//    - En Facebook Developer Console, agrega el OAuth redirect URI de Firebase
// 
// 7. Copia tus credenciales aquí:

// ========== Firebase Configuration (NO necesitas esto para React Native Firebase) ==========
// React Native Firebase se configura automáticamente con google-services.json
// Esta configuración solo es necesaria para Firebase Web SDK

export const firebaseConfig = {
  apiKey: "AIzaSyBsOXM5QgzxdZ5oGnH73Mz5zJGbCKkBQkQ",
  authDomain: "duolove-a9025.firebaseapp.com",
  projectId: "duolove-a9025",
  storageBucket: "duolove-a9025.firebasestorage.app",
  messagingSenderId: "869262905209",
  appId: "1:869262905209:web:58afdc79566ce52cd8a9a8",
  measurementId: "G-FQF4V0R664"
};

// ========== Google Sign-In Configuration ==========
// IMPORTANTE: Encuentra este valor en google-services.json
// Busca en: client > oauth_client > client_type: 3 > client_id
export const GOOGLE_WEB_CLIENT_ID = 'TU_WEB_CLIENT_ID.apps.googleusercontent.com';

// ========== Facebook Login Configuration ==========
// Encuentra estos valores en https://developers.facebook.com/apps/
export const FACEBOOK_APP_ID = 'TU_FACEBOOK_APP_ID';
export const FACEBOOK_CLIENT_TOKEN = 'TU_FACEBOOK_CLIENT_TOKEN';

