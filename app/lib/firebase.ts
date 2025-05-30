import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { storage } from '../../firebaseConfig'; // 既存の設定ファイルをインポート
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import uuid from 'react-native-uuid';

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

// Upload the image to Storage and return the download URL
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

// Analyze the image and save the result and image information to Firestore
export async function analyzeAndSaveImage(
    imageUrl: string,
    userId: string 
): Promise<void> {
    console.log('analyzeAndSaveImage started with URL:', imageUrl, 'and userId:', userId);
    try {
        const functionsInstance = getFunctions(); 
        const analyzeImageFunction = httpsCallable(functionsInstance, 'analyzeImage');

        const analysisResult = await analyzeImageFunction({ imageUrl });
        const data = analysisResult.data as {
            description: string;
            possibleItems: { japanese: string; english: string; distractors: string[]; }[]; // 配列の要素は日本語と英語のペアのオブジェクトにするなら
          };

        if (!data.description || !data.possibleItems) {
            throw new Error('AI analysis did not return expected data.');
        }

        // Save the result and image information to Firestore
        await addDoc(collection(db, 'userImages'), { // 'userImages' is the collection name (change as needed)
            userId: userId,
            imageUrl: imageUrl,
            description: data.description,
            tags: data.possibleItems.map(item => ({
                english: item.english,
                japanese: item.japanese,
                distractors: item.distractors,
              })),
            createdAt: serverTimestamp(), // Use the server-side timestamp
        });
        console.log('Image and analysis saved to Firestore');

    } catch (error) {
        console.error('Error in analyzeAndSaveImage:', error);
        throw error; // Pass the error to the caller
    }
    console.log('analyzeAndSaveImage finished');
}