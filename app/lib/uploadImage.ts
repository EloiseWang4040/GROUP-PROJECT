import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from "@/firebaseConfig";
import { v4 as uuidv4 } from 'uuid';
import { auth } from "@/firebaseConfig"; // Firebase Auth をインポート

export async function uploadImage(uri: string): Promise<{ imageUrl: string }> {
    try {
        const user = auth.currentUser; // 現在ログイン中のユーザーを取得
        if (!user) {
            throw new Error('ユーザーが認証されていません');
        }

        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = `uploads/${user.uid}/${Date.now()}-${uuidv4()}.jpg`; // ユーザーIDをパスに含める
        const storageRef = ref(storage, filename);

        await uploadBytes(storageRef, blob);
        const imageUrl = await getDownloadURL(storageRef);

        return { imageUrl };
    } catch (error) {
        console.error('画像のアップロード中にエラー:', error);
        throw new Error('画像のアップロードに失敗しました');
    }
}
