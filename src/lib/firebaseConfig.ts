import appletConfig from '../../firebase-applet-config.json';

// Firebase configuration provisioned for this project
export const firebaseConfig = {
  projectId: appletConfig.projectId || "gen-lang-client-0629789069",
  appId: appletConfig.appId || "1:98520988918:web:92ca7acb246cf8736480d7",
  apiKey: appletConfig.apiKey || "AIzaSyCDgykI7Pq0nf9cu4N0okgJyxM0nR4XLTQ",
  authDomain: appletConfig.authDomain || "gen-lang-client-0629789069.firebaseapp.com",
  firestoreDatabaseId: appletConfig.firestoreDatabaseId || "ai-studio-film-2eab4202-60ef-4b8c-98a7-d146eb20987f",
  storageBucket: appletConfig.storageBucket || "gen-lang-client-0629789069.firebasestorage.app",
  messagingSenderId: appletConfig.messagingSenderId || "98520988918",
  measurementId: appletConfig.measurementId || "",
  oAuthClientId: appletConfig.oAuthClientId || "98520988918-pv7sibqrb02h1qjje66camctjf40da10.apps.googleusercontent.com",
  recaptchaSiteKey: appletConfig.recaptchaSiteKey || ""
};

export default firebaseConfig;
