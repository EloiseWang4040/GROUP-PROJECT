import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { storage } from '../../firebaseConfig'; // 既存の設定ファイルをインポート

// Firebase初期化は既存のfirebaseConfig.tsで行われているため、
// ここでは必要な関数のみを追加

// Functionsのインスタンスを取得
const functions = getFunctions();

if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
    connectFunctionsEmulator(functions, "localhost", 5001);
    console.log('Functions エミュレータに接続しました');
}

// Firebase Cloud Functions呼び出し用の関数
export const analyzeImageWithAI = async (imageUrl: string) => {
    console.debug("Analyze image with AI");
    try {
        const analyzeImageFunction = httpsCallable(functions, 'analyzeImage');
        const result = await analyzeImageFunction({ imageUrl });
        return result.data;
    } catch (error) {
        console.error('Firebase Function呼び出しエラー:', error);
        throw error;
    }
};