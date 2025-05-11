// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

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

export { auth, storage};
