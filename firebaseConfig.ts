// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth} from "firebase/auth";
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
    apiKey: "AIzaSyAimHxm2q0NXvq7YNdNYrqh8iMcp4ihmQU",
    authDomain: "exposample-4eccf.firebaseapp.com",
    projectId: "exposample-4eccf",
    storageBucket: "exposample-4eccf.firebasestorage.app",
    messagingSenderId: "713772137412",
    appId: "1:713772137412:ios:36df7ef36ff50551734291",
};

// すでに初期化されていればそれを使う、そうでなければ初期化する
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// 開発環境判定
const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';

// 環境に応じた functions の初期化
const functions = isLocal
    // 開発環境ではデフォルトリージョン（us-central1）を使用
    ? getFunctions(app)
    // 本番環境では asia-northeast1 を指定
    : getFunctions(app, "asia-northeast1");

// ローカル環境の場合、エミュレータに接続
if (isLocal) {
    connectFunctionsEmulator(functions, "localhost", 5001);
    console.log("✅ Functions エミュレータに接続しました (localhost:5001)");
}

export { auth, storage, functions };