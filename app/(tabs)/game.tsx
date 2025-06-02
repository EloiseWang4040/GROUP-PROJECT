// ImageWordQuiz.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db, auth } from '../../firebaseConfig';

interface FirestoreImageInfo {
  id: string; // FirestoreドキュメントID
  imageUrl: string;
  tags: { english: string; distractors: string[]; }[];
  createdAt?: any; // Timestampなど
  // userId?: string; // 必要であれば
}

interface QuizItem {
  img: string
  words: string[]
  answer: string
}

export default function GameScreen () {  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [quizData, setQuizData] = useState<QuizItem[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  
  const shuffle = <T,>(array: T[]): T[] => {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
  
  useEffect(() => {
    const fetchImages = async () => {
      const currentUserId = auth.currentUser?.uid
      if (!currentUserId) return
  
      const q = query(
        collection(db, 'userImages'),
        where('userId', '==', currentUserId)
      )
      const snapshot = await getDocs(q)
  
      const images: FirestoreImageInfo[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreImageInfo[]
  
      const quizzes = generateQuizData(images)
      setQuizData(quizzes)
      setLoading(false)
    }
    fetchImages()
  }, [])


  const generateQuizData = (userImages: FirestoreImageInfo[]): QuizItem[] => {
    const quizItems = userImages.flatMap(image =>
      image.tags.map(tag => ({
        img: image.imageUrl,
        words: shuffle([tag.english, ...(tag.distractors || [])]).slice(0, 4),
        answer: tag.english
      }))
    )
    return shuffle(quizItems) // ← ここで全体をシャッフル！
  }

  const handleSelect = (word: string) => {
    const correct = quizData[currentIndex].answer
  
    if (word === correct) {
      setScore(prev => prev + 10)
      setFeedback('✅ Correct! +10 points')
    } else {
      setFeedback(`❌ Incorrect! Correct answer: ${correct}`)
    }
  
    setTimeout(() => {
      setFeedback(null)
      setCurrentIndex(prev => prev + 1)
    }, 1000)
  }

  const restart = () => {
    setCurrentIndex(0)
    setScore(0)
  }

  if (loading) {
    return <ActivityIndicator size="large" />
  }

  if (currentIndex >= quizData.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.resultTitle}>All done!</Text>
        <Text style={styles.score}>
          Your Score: {score}
        </Text>
        <Text style={styles.score}>
          Accuracy: {Math.round(score / (quizData.length * 10) * 100)}%
        </Text>
        <TouchableOpacity style={styles.restartButton} onPress={restart}>
          <Text style={styles.restartText}>Restart</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const question = quizData[currentIndex]

  return (
    <View style={styles.container}>
      <View style={styles.quizCard}>
        <Image source={{ uri: question.img }} style={styles.image}/>
        <Text style={styles.questionCount}>
          Question {currentIndex + 1} / {quizData.length}
        </Text>
        {feedback && (
        <Text style={{
          fontSize: 18,
          color: feedback.startsWith('✅') ? 'green' : 'red',
          marginBottom: 10,
          textAlign: 'center'
        }}>
          {feedback}
        </Text>
      )}
        <FlatList
          data={question.words}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.optionText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  quizCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  questionCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#e9f0ff',
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  optionText: {
    color: '#0056b3',
    fontSize: 16,
    textAlign: 'center',
  },
  resultTitle: {
    fontSize: 26,
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  score: {
    fontSize: 20,
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  restartText: {
    color: '#fff',
    fontSize: 16,
  },
})
