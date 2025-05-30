import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { collection, query, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig'; // FirestoreインスタンスとAuthインスタンスをインポート

const { width } = Dimensions.get('window');
const imageSize = width / 2 - 16;

interface FirestoreImageInfo {
    id: string; // FirestoreドキュメントID
    imageUrl: string;
    description: string;
    tags: string[];
    createdAt?: any; // Timestampなど
    // userId?: string; // 必要であれば
}

export default function MemoriesScreen() {
    const { reload } = useLocalSearchParams(); // リロードトリガー用
    const [images, setImages] = useState<FirestoreImageInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentUserId = auth.currentUser?.uid;

    useEffect(() => {
        if (!currentUserId) {
            setIsLoading(false);
            // ここでログインしていないユーザー向けの表示やリダイレクトを行う
            console.log("User not logged in, cannot fetch memories.");
            return;
        }

        setIsLoading(true);
        // userImages コレクションから現在のユーザーの画像を取得し、createdAtで降順ソート
        const q = query(collection(db, "userImages"), orderBy("createdAt", "desc"));
        // where("userId", "==", currentUserId) を追加してユーザーごとの画像にする場合はインデックス設定が必要

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedImages: FirestoreImageInfo[] = [];
            querySnapshot.forEach((doc: DocumentData) => { // doc の型を明示
                fetchedImages.push({ id: doc.id, ...doc.data() } as FirestoreImageInfo);
            });
            setImages(fetchedImages);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching images from Firestore: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe(); // クリーンアップ
    }, [currentUserId, reload]); // currentUserIdやreloadが変わった時に再取得

    const renderItem = ({ item }: { item: FirestoreImageInfo }) => (
        <View style={styles.imageContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.captionContainer}>
                <Text style={styles.captionText} numberOfLines={2}>
                    {item.description || '説明なし'}
                </Text>
                {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {item.tags.map((tag, index) => (
                            <View key={index} style={styles.tagBox}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    if (!currentUserId) {
         return <View style={styles.centered}><Text>Please log in to see your memories.</Text></View>;
    }
    
    if (images.length === 0) {
        return <View style={styles.centered}><Text>No memories yet. Start by taking a picture!</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Memories</Text>
            <FlatList
                data={images}
                keyExtractor={(item) => item.id} // FirestoreドキュメントIDをキーに
                numColumns={2}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({ // スタイル定義は既存のものを流用・調整
    // ... (既存のスタイル)
    centered: { // ローディングや空メッセージ表示用
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // 他のスタイル (imageContainer, image, captionContainer, etc.) は前のコードを参照
    container: { flex: 1, padding: 8, },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', },
    list: { paddingHorizontal: 8, },
    imageContainer: { margin: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: '#eee' },
    image: { width: imageSize, height: imageSize, resizeMode: 'cover', },
    captionContainer: { padding: 8, backgroundColor: 'rgba(0, 0, 0, 0.7)', },
    captionText: { color: 'white', fontSize: 12, marginBottom: 4, },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, },
    tagBox: { backgroundColor: '#1e88e5', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, },
    tagText: { color: 'white', fontSize: 10, },
});