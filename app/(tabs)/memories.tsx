import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { fetchImages, ImageInfo  } from '../lib/fetchImages';

const { width } = Dimensions.get('window');
const imageSize = width / 2 - 16;

export default function MemoriesScreen() {
    const { imageUri } = useLocalSearchParams();
    const [images, setImages] = useState<ImageInfo[]>([]);
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

    const renderItem = ({ item }: { item: ImageInfo }) => (
        <View style={styles.imageContainer}>
            <Image source={{ uri: item.url }} style={styles.image} />
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Memories Screen</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },list: {
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
});