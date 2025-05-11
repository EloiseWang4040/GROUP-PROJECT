import { listAll, ref, getDownloadURL, getMetadata } from 'firebase/storage';
import { storage } from "@/firebaseConfig"; // Firebaseの初期化ファイルへのパス

export interface ImageInfo {
    name: string;
    url: string;
    uploadedAt: string; // 仮の値
}

export async function fetchImages(): Promise<ImageInfo[]> {
    try {
        const storageRef = ref(storage, 'uploads');
        const result = await listAll(storageRef);

        const images: ImageInfo[] = await Promise.all(
            result.items.map(async (item) => {
                const url = await getDownloadURL(item);
                const metadata = await getMetadata(item);
                return {
                    name: item.name,
                    url,
                    uploadedAt: metadata.timeCreated,// 仮の値
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
