import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { fetchImages, ImageInfo } from '../lib/fetchImages';
import { analyzeImageWithAI } from '../lib/firebase';

const { width } = Dimensions.get('window');
const imageSize = width / 2 - 16;

export default function MemoriesScreen() {
    const { imageUri, description, tags } = useLocalSearchParams();
    const [images, setImages] = useState<ImageInfo[]>([]);
    const [results, setResults] = useState<{
        [key: string]: {
            caption: string;
            tags: string[];
        }
    }>({});
    const { reload } = useLocalSearchParams();

    useEffect(() => {
        const loadImages = async () => {
            try {
                const fetched = await fetchImages();

                const localImage: ImageInfo[] =
                    typeof imageUri === 'string'
                        ? [{ name: 'captured', url: imageUri, uploadedAt: new Date().toISOString() }]
                        : [];

                setImages([...localImage, ...fetched]);
            } catch (error) {
                console.error('画像一覧取得に失敗しました', error);
            }
        };

        loadImages();
    }, [reload]);

    // 新規追加画像の認識結果があれば設定
    useEffect(() => {
        if (typeof imageUri === 'string' && typeof description === 'string') {
            let parsedTags: string[] = [];
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : [];
            } catch (e) {
                console.error('タグのパース失敗', e);
            }

            setResults(prev => ({
                ...prev,
                captured: {
                    caption: description,
                    tags: parsedTags
                }
            }));
        }
    }, [imageUri, description, tags]);

    // 画像が増えたら順次 OpenAI へ送る
    useEffect(() => {
        images.forEach(img => {
            if (results[img.name]) return;

            (async () => {
                try {
                    // analyzeImageWithAI関数を使用
                    const result = await analyzeImageWithAI(img.url);
                    console.log(`[Debug][${img.name}] result:`, result);

                    setResults(prev => ({
                        ...prev,
                        [img.name]: {
                            caption: result.description,
                            tags: result.possibleItems || []
                        }
                    }));
                } catch (e) {
                    console.error('認識失敗', e);
                    setResults(prev => ({
                        ...prev,
                        [img.name]: { caption: '認識失敗', tags: [] },
                    }));
                }
            })();
        });
    }, [images]);

    const renderItem = ({ item }: { item: ImageInfo }) => (
        <View style={styles.imageContainer}>
            <Image source={{ uri: item.url }} style={styles.image} />
            {results[item.name] ? (
                <View style={styles.captionContainer}>
                    <Text style={styles.captionText} numberOfLines={2}>
                        {results[item.name].caption}
                    </Text>
                    <View style={styles.tagsContainer}>
                        {results[item.name].tags.map((tag, index) => (
                            <View key={index} style={styles.tagBox}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ) : (
                <View style={styles.captionContainer}>
                    <Text style={styles.captionText}>読み込み中...</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Memories</Text>
            <FlatList
                data={images}
                keyExtractor={(item) => item.name}
                numColumns={2}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    list: {
        paddingHorizontal: 8,
    },
    imageContainer: {
        margin: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        width: imageSize,
        height: imageSize,
        resizeMode: 'cover',
    },
    captionContainer: {
        padding: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    captionText: {
        color: 'white',
        fontSize: 12,
        marginBottom: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    tagBox: {
        backgroundColor: '#1e88e5',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    tagText: {
        color: 'white',
        fontSize: 10,
    },
});