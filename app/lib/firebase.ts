import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { storage } from '../../firebaseConfig'; // 既存の設定ファイルをインポート
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import uuid from 'react-native-uuid';

// Firebase初期化は既存のfirebaseConfig.tsで行われているため、
// ここでは必要な関数のみを追加

// Functionsのインスタンスを取得
const functions = getFunctions();

if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    console.log('Functions エミュレータに接続しました (127.0.0.1:5001)');
}

// // Firebase Cloud Functions呼び出し用の関数
// export const analyzeImageWithAI = async (imageUrl: string) => {
//     console.debug("Analyze image with AI");
//     try {
//         const analyzeImageFunction = httpsCallable(functions, 'analyzeImage');
//         const result = await analyzeImageFunction({ imageUrl });
//         return result.data;
//     } catch (error) {
//         console.error('Firebase Function呼び出しエラー:', error);
//         throw error;
//     }
// };

// 画像をStorageにアップロードし、ダウンロードURLを返す関数 (既存のものを想定)
export async function uploadImageAndGetURL(imageUri: string, userId: string): Promise<string> {
    const user = auth.currentUser;
        if (!user) {
            throw new Error('ユーザーが認証されていません');
        }
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const filename = `uploads/${user.uid}/${Date.now()}-${uuid.v4()}.jpg`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}

// 画像を解析し、結果と画像情報をFirestoreに保存する関数 (新規作成)
export async function analyzeAndSaveImage(
    imageUrl: string,
    userId: string // ユーザーIDも保存する場合
): Promise<void> {
    console.log('analyzeAndSaveImage started with URL:', imageUrl, 'and userId:', userId);
    try {
        const functionsInstance = getFunctions(); // functionsインスタンスを取得
        const analyzeImageFunction = httpsCallable(functionsInstance, 'analyzeImage');

        const analysisResult = await analyzeImageFunction({ imageUrl });
        const data = analysisResult.data as { description: string; possibleItems: string[] }; // 型アサーション

        if (!data.description || !data.possibleItems) {
            throw new Error('AI analysis did not return expected data.');
        }

        // Firestoreに保存
        await addDoc(collection(db, 'userImages'), { // 'userImages' はコレクション名（適宜変更）
            userId: userId,
            imageUrl: imageUrl,
            description: data.description,
            tags: data.possibleItems,
            createdAt: serverTimestamp(), // サーバー側のタイムスタンプを利用
        });
        console.log('Image and analysis saved to Firestore');

    } catch (error) {
        console.error('Error in analyzeAndSaveImage:', error);
        throw error; // エラーを呼び出し元に伝える
    }
    console.log('analyzeAndSaveImage finished');
}