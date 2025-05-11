import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from "@/firebaseConfig";// あなたのfirebase設定ファイルへのパス
import { v4 as uuidv4 } from 'uuid';

export async function uploadImage(uri: string): Promise<{ imageUrl: string }> {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = `uploads/${Date.now()}.jpg`;
        const storageRef = ref(storage, filename);

        await uploadBytes(storageRef, blob);
        const imageUrl = await getDownloadURL(storageRef);

        return { imageUrl };
    } catch (error) {
        console.error('画像のアップロード中にエラー:', error);
        throw new Error('画像のアップロードに失敗しました');
    }
}
