import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { collection, query, where, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig'; // FirestoreインスタンスとAuthインスタンスをインポート
import { format } from "date-fns";

const { width } = Dimensions.get('window');
const imageSize = width / 2 - 16;
function formatDate(timestamp: any) {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "yy/MM/dd");
  }

interface FirestoreImageInfo {
    id: string; // FirestoreドキュメントID
    imageUrl: string;
    tags: { japanese: string; english: string }[];
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
        const q = query(
            collection(db, "userImages"),
            where("userId", "==", currentUserId), // 現在のユーザーIDでフィルタリング
            orderBy("createdAt", "desc")
        );
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
        <View style={styles.card}>
            <Text style={styles.dateText}>{item.createdAt ? formatDate(item.createdAt) : "日付不明"}</Text>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            <View style={styles.tagsColumn}>
                {item.tags.map(({ english, japanese }, index) => (
                <View key={index} style={styles.tagRow}>
                    <Text style={styles.english}>{english}：</Text>
                    <Text style={styles.japanese}>{japanese}</Text>
                </View>
                ))}
            </View>
        </View>
    );

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    if (!currentUserId) {
         return <View style={styles.centered}><Text>Please login to see your memories.</Text></View>;
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
                numColumns={1}
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
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginVertical: 12,
        marginHorizontal: 16,
        // iOS shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        // Android shadow
        elevation: 3,
        alignItems: "center",
      },
      cardImage: {
        width: "80%",
        aspectRatio: 1,
        borderRadius: 12,
        marginBottom: 12,
      },
      dateText: {
        fontSize: 20,
        color: "#666",
        marginBottom: 16,
        textAlign: "center",
      },
      tagsColumn: {
        width: "100%",
      },
      tagRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 8,
      },
      english: {
        fontWeight: "bold",
        fontSize: 18,
        color: "#222",
      },
      japanese: {
        fontSize: 18,
        color: "#555",
        marginLeft: 6,
      },
    // 他のスタイル (imageContainer, image, captionContainer, etc.) は前のコードを参照
    container: { flex: 1, padding: 8, },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', },
    list: { paddingHorizontal: 8, },
    imageContainer: { margin: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: '#eee' },
    itemContainer: { marginVertical: 12, paddingHorizontal: 16, alignItems: "center" },
    image: { width: "100%", aspectRatio: 1, borderRadius: 12, marginBottom: 8 },
});