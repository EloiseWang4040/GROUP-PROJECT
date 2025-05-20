import { listAll, ref, getDownloadURL, getMetadata } from 'firebase/storage';
import { storage } from "@/firebaseConfig";
import { auth } from "@/firebaseConfig"; // Firebase Auth をインポート

export interface ImageInfo {
    name: string;
    url: string;
    uploadedAt: string;
}

export async function fetchImages(): Promise<ImageInfo[]> {
    try {
        const user = auth.currentUser; // 現在ログイン中のユーザーを取得
        if (!user) {
            throw new Error('ユーザーが認証されていません');
        }

        const storageRef = ref(storage, `uploads/${user.uid}`); // ユーザーIDをパスに含める
        const result = await listAll(storageRef);

        const images: ImageInfo[] = await Promise.all(
            result.items.map(async (item) => {
                const url = await getDownloadURL(item);
                const metadata = await getMetadata(item);
                return {
                    name: item.name,
                    url,
                    uploadedAt: metadata.timeCreated,
                };
            })
        );

        images.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

        return images;
    } catch (error) {
        console.error('画像一覧取得エラー:', error);
        throw new Error('画像一覧の取得に失敗しました');
    }
}
