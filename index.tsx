import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Flashcard {
  question: string;
  answer: string;
}

export default function HomeScreen() {
  // Timer state
  const [seconds, setSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Flashcard state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  // Input state
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');

  // Timer effect
  useEffect(() => {
    let timer: number | undefined;
    if (isRunning && seconds > 0) {
      timer = setInterval(() => setSeconds(prev => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, seconds]);

  // Timer controls
  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setSeconds(25 * 60);
    setIsRunning(false);
  };

  // Flashcard controls
  const nextCard = () => {
    if (flashcards.length === 0) return;
    setShowAnswer(false);
    setCardIndex((prev) => (prev + 1) % flashcards.length);
  };
  const toggleAnswer = () => setShowAnswer(!showAnswer);

  // Add new flashcard
  const addFlashcard = () => {
    if (!newQuestion || !newAnswer) return;
    const newCard: Flashcard = { question: newQuestion, answer: newAnswer };
    setFlashcards([...flashcards, newCard]);
    setNewQuestion('');
    setNewAnswer('');
    setCardIndex(flashcards.length); // show the new card immediately
    setShowAnswer(false);
  };

  // Format timer
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const currentCard = flashcards[cardIndex];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📝 Studious </Text>

      {/* Timer */}
      <Text style={styles.timer}>{formatTime(seconds)}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={toggleTimer}>
          <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.reset]} onPress={resetTimer}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Flashcard input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Definition"
          value={newQuestion}
          onChangeText={setNewQuestion}
          style={styles.input}
        />
        <TextInput
          placeholder="Term"
          value={newAnswer}
          onChangeText={setNewAnswer}
          style={styles.input}
        />
        <TouchableOpacity style={styles.addButton} onPress={addFlashcard}>
          <Text style={styles.buttonText}>Add Card</Text>
        </TouchableOpacity>
      </View>

      {/* Flashcards */}
      {flashcards.length > 0 && (
        <>
          <View style={styles.flashcard}>
            <Text style={styles.cardText}>
              {showAnswer ? currentCard.answer : currentCard.question}
            </Text>
          </View>
          <View style={styles.flashcardButtons}>
            <TouchableOpacity style={styles.button} onPress={toggleAnswer}>
              <Text style={styles.buttonText}>
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.reset]} onPress={nextCard}>
              <Text style={styles.buttonText}>Next Card</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E6F4FE',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0B3954',
    textAlign: 'center',
  },
  timer: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#0B3954',
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  flashcard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 20,
    textAlign: 'center',
  },
  flashcardButtons: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#0878D0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  reset: {
    backgroundColor: '#6C757D',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#0878D0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
