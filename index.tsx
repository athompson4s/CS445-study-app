import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';

interface Flashcard {
  question: string;
  answer: string;
}

interface StudySet {
  name: string;
  flashcards: Flashcard[];
}

export default function HomeScreen() {
  // Timer state
  const [seconds, setSeconds] = useState<number>(5 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Study sets
  const [studySets, setStudySets] = useState<StudySet[]>([
    { name: 'Default Set', flashcards: [] },
  ]);
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);

  // Flashcards
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  // Input states
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [newSetName, setNewSetName] = useState<string>('');

  // Edit states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editQuestion, setEditQuestion] = useState<string>('');
  const [editAnswer, setEditAnswer] = useState<string>('');

  // --- Content Filtering ---
  const bannedWords = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn',
    'cunt', 'slut', 'whore', 'cock', 'dick', 'pussy',
    'offensiveword', 'badword1', 'badword2', 'curse', 'offensive'
  ];

  const codePatterns = [
    /<script.*?>.*?<\/script>/gi,
    /on\w+=/gi,
    /function\s*\(/gi,
    /import\s+.*from/gi,
    /<.*?>/g,
    /\{.*\}/g,
  ];

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const containsProfanity = (text: string) => {
    const clean = normalizeText(text);
    return bannedWords.some(word => {
      const pattern = new RegExp(`\\b${word}\\b`, 'i');
      return pattern.test(clean);
    });
  };

  const containsCodeInjection = (text: string) => {
    return codePatterns.some(pattern => pattern.test(text));
  };

  const isInputClean = (text: string) => {
    if (!text.trim()) return false;

    if (containsProfanity(text)) {
      Alert.alert('⚠️ Inappropriate Content', 'Please avoid using profanity or offensive terms.');
      return false;
    }
    if (containsCodeInjection(text)) {
      Alert.alert('⚠️ Invalid Input', 'Code-like input or script syntax is not allowed.');
      return false;
    }
    return true;
  };

  // --- Timer Effect ---
  useEffect(() => {
    let timer: number | undefined;
    if (isRunning && seconds > 0) {
      timer = setInterval(() => setSeconds(prev => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, seconds]);

  // --- Timer Controls ---
  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setSeconds(5 * 60);
    setIsRunning(false);
  };

  // --- Study Set Controls ---
  const currentSet = studySets[currentSetIndex];
  const currentCard = currentSet.flashcards[cardIndex];

  const nextSet = () => {
    if (studySets.length <= 1) return;
    setShowAnswer(false);
    setCardIndex(0);
    setIsEditing(false);
    setCurrentSetIndex((prev) => (prev + 1) % studySets.length);
  };

  const prevSet = () => {
    if (studySets.length <= 1) return;
    setShowAnswer(false);
    setCardIndex(0);
    setIsEditing(false);
    setCurrentSetIndex((prev) => (prev - 1 + studySets.length) % studySets.length);
  };

  const deleteCurrentSet = () => {
    if (studySets.length <= 1) {
      Alert.alert("Can't Delete", "You must have at least one study set.");
      return;
    }

    Alert.alert(
      'Delete Study Set',
      `Are you sure you want to delete "${currentSet.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedSets = studySets.filter((_, i) => i !== currentSetIndex);
            const newIndex = Math.max(0, currentSetIndex - 1);
            setStudySets(updatedSets);
            setCurrentSetIndex(newIndex);
            setCardIndex(0);
          },
        },
      ]
    );
  };

  // --- Flashcard Controls ---
  const nextCard = () => {
    if (currentSet.flashcards.length === 0) return;
    setShowAnswer(false);
    setIsEditing(false);
    setCardIndex((prev) => (prev + 1) % currentSet.flashcards.length);
  };

  const toggleAnswer = () => setShowAnswer(!showAnswer);

  const addFlashcard = () => {
    if (!newQuestion || !newAnswer) return;
    if (!isInputClean(newQuestion) || !isInputClean(newAnswer)) return;

    const newCard: Flashcard = { question: newQuestion, answer: newAnswer };
    const updatedSets = [...studySets];
    updatedSets[currentSetIndex].flashcards.push(newCard);
    setStudySets(updatedSets);
    setNewQuestion('');
    setNewAnswer('');
    setCardIndex(updatedSets[currentSetIndex].flashcards.length - 1);
    setShowAnswer(false);
  };

  const deleteCurrentFlashcard = () => {
    if (!currentCard) return;

    Alert.alert(
      'Delete Flashcard',
      'Are you sure you want to delete this flashcard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedSets = [...studySets];
            updatedSets[currentSetIndex].flashcards.splice(cardIndex, 1);
            setStudySets(updatedSets);
            setCardIndex(0);
            setShowAnswer(false);
            setIsEditing(false);
          },
        },
      ]
    );
  };

  const addStudySet = () => {
    if (!newSetName.trim()) return;
    if (!isInputClean(newSetName)) return;

    const newSet: StudySet = { name: newSetName.trim(), flashcards: [] };
    setStudySets([...studySets, newSet]);
    setCurrentSetIndex(studySets.length);
    setNewSetName('');
    setCardIndex(0);
    setShowAnswer(false);
    setIsEditing(false);
  };

  // --- Edit Flashcards ---
  const startEditing = () => {
    if (!currentCard) return;
    setEditQuestion(currentCard.question);
    setEditAnswer(currentCard.answer);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!isInputClean(editQuestion) || !isInputClean(editAnswer)) return;

    const updatedSets = [...studySets];
    updatedSets[currentSetIndex].flashcards[cardIndex] = {
      question: editQuestion,
      answer: editAnswer,
    };
    setStudySets(updatedSets);
    setIsEditing(false);
    setShowAnswer(false);
  };

  const cancelEdit = () => setIsEditing(false);

  // --- Format Timer ---
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📝 Studious</Text>

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

      {/* Study Set Controls */}
      <View style={styles.studySetContainer}>
        <TouchableOpacity onPress={prevSet} style={styles.arrowButton}>
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>

        <Text style={styles.studySetTitle}>{currentSet.name}</Text>

        <TouchableOpacity onPress={nextSet} style={styles.arrowButton}>
          <Text style={styles.arrowText}>▶</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.deleteButton]} onPress={deleteCurrentSet}>
        <Text style={styles.deleteText}>🗑 Delete Set</Text>
      </TouchableOpacity>

      {/* New Study Set Input */}
      <View style={styles.newSetContainer}>
        <TextInput
          placeholder="New Set Name (e.g. Science)"
          value={newSetName}
          onChangeText={setNewSetName}
          style={styles.input}
        />
        <TouchableOpacity style={styles.addButton} onPress={addStudySet}>
          <Text style={styles.buttonText}>Add Set</Text>
        </TouchableOpacity>
      </View>

      {/* Flashcard Input */}
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

      {/* Flashcard Display */}
      {currentSet.flashcards.length > 0 && (
        <>
          <View style={styles.flashcard}>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editQuestion}
                  onChangeText={setEditQuestion}
                  placeholder="Edit Definition"
                />
                <TextInput
                  style={styles.input}
                  value={editAnswer}
                  onChangeText={setEditAnswer}
                  placeholder="Edit Term"
                />
                <View style={styles.flashcardButtons}>
                  <TouchableOpacity style={styles.button} onPress={saveEdit}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.reset]} onPress={cancelEdit}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.cardText}>
                {showAnswer ? currentCard.answer : currentCard.question}
              </Text>
            )}
          </View>

          {!isEditing && (
            <View style={styles.flashcardButtons}>
              <TouchableOpacity style={styles.button} onPress={toggleAnswer}>
                <Text style={styles.buttonText}>
                  {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={startEditing}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.reset]} onPress={nextCard}>
                <Text style={styles.buttonText}>Next Card</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.deleteButton} onPress={deleteCurrentFlashcard}>
            <Text style={styles.deleteText}>🗑 Delete Flashcard</Text>
          </TouchableOpacity>
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
  studySetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 10,
  },
  arrowButton: {
    paddingHorizontal: 10,
  },
  arrowText: {
    fontSize: 24,
    color: '#0B3954',
  },
  studySetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B3954',
  },
  newSetContainer: {
    width: '100%',
    marginBottom: 20,
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
    gap: 10,
    marginBottom: 10,
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
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    width: '100%',
  },
  addButton: {
    backgroundColor: '#0878D0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButton: {
    marginTop: 5,
    backgroundColor: '#FF5C5C',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
