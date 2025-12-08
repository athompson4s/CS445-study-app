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

export default function App() {
  // -----------------------------
  // 🔵 NAVIGATION STATE
  // -----------------------------
  const [screen, setScreen] = useState<"home" | "flashcards" | "timer" | "notes">("home");

  // -----------------------------
  // 🔵 TIMER STATE
  // -----------------------------
  const [seconds, setSeconds] = useState<number>(5 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // -----------------------------
  // 🔵 STUDY SETS + FLASHCARDS
  // -----------------------------
  const [studySets, setStudySets] = useState<StudySet[]>([
    { name: 'Default Set', flashcards: [] },
  ]);
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  // Inputs
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [newSetName, setNewSetName] = useState<string>('');

  // Editing
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editQuestion, setEditQuestion] = useState<string>('');
  const [editAnswer, setEditAnswer] = useState<string>('');

  // -----------------------------
  // 🔵 CONTENT FILTERING
  // -----------------------------
  const bannedWords = [
    'fuck','shit','bitch','asshole','bastard','damn',
    'cunt','slut','whore','cock','dick','pussy',
    'offensiveword','badword1','badword2','curse','offensive'
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

  // -----------------------------
  // 🔵 TIMER EFFECT
  // -----------------------------
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && seconds > 0) {
      timer = setInterval(() => setSeconds(prev => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, seconds]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setSeconds(5 * 60);
    setIsRunning(false);
  };

  // -----------------------------
  // 🔵 STUDY SET CONTROLS
  // -----------------------------
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

  // -----------------------------
  // 🔵 FLASHCARD CONTROLS
  // -----------------------------
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
    const newCard = { question: newQuestion, answer: newAnswer };
    const updated = [...studySets];
    updated[currentSetIndex].flashcards.push(newCard);
    setStudySets(updated);
    setNewQuestion('');
    setNewAnswer('');
    setCardIndex(updated[currentSetIndex].flashcards.length - 1);
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
            const updated = [...studySets];
            updated[currentSetIndex].flashcards.splice(cardIndex, 1);
            setStudySets(updated);
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
    const newSet = { name: newSetName.trim(), flashcards: [] };
    setStudySets([...studySets, newSet]);
    setCurrentSetIndex(studySets.length);
    setNewSetName('');
    setCardIndex(0);
    setShowAnswer(false);
    setIsEditing(false);
  };

  const startEditing = () => {
    if (!currentCard) return;
    setEditQuestion(currentCard.question);
    setEditAnswer(currentCard.answer);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!isInputClean(editQuestion) || !isInputClean(editAnswer)) return;
    const updated = [...studySets];
    updated[currentSetIndex].flashcards[cardIndex] = {
      question: editQuestion,
      answer: editAnswer,
    };
    setStudySets(updated);
    setIsEditing(false);
    setShowAnswer(false);
  };

  const cancelEdit = () => setIsEditing(false);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // -----------------------------
  // 🔵 HOME SCREEN
  // -----------------------------
  const renderHomeScreen = () => (
    <View style={styles.homeContainer}>
      <Text style={styles.homeTitle}>📚 Studious</Text>

      <TouchableOpacity style={styles.homeButton} onPress={() => setScreen("flashcards")}>
        <Text style={styles.homeButtonText}>📝 Flashcards</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.homeButton} onPress={() => setScreen("timer")}>
        <Text style={styles.homeButtonText}>⏱ Timer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.homeButton} onPress={() => setScreen("notes")}>
        <Text style={styles.homeButtonText}>🗒 Notes</Text>
      </TouchableOpacity>
    </View>
  );

  // -----------------------------
  // 🔵 MAIN UI
  // -----------------------------
  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* HOME */}
      {screen === "home" && renderHomeScreen()}

      {/* FLASHCARDS SCREEN */}
      {screen === "flashcards" && (
        <>
          <TouchableOpacity onPress={() => setScreen("home")}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>📝 Flashcards</Text>

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

          <TouchableOpacity style={styles.deleteButton} onPress={deleteCurrentSet}>
            <Text style={styles.deleteText}>🗑 Delete Set</Text>
          </TouchableOpacity>

          {/* New Set Input */}
          <TextInput
            placeholder="New Set Name"
            style={styles.input}
            value={newSetName}
            onChangeText={setNewSetName}
          />
          <TouchableOpacity style={styles.addButton} onPress={addStudySet}>
            <Text style={styles.buttonText}>Add Set</Text>
          </TouchableOpacity>

          {/* Flashcard Input */}
          <TextInput
            placeholder="Definition"
            style={styles.input}
            value={newQuestion}
            onChangeText={setNewQuestion}
          />
          <TextInput
            placeholder="Term"
            style={styles.input}
            value={newAnswer}
            onChangeText={setNewAnswer}
          />
          <TouchableOpacity style={styles.addButton} onPress={addFlashcard}>
            <Text style={styles.buttonText}>Add Card</Text>
          </TouchableOpacity>

          {/* Flashcard */}
          {currentSet.flashcards.length > 0 && (
            <>
              <View style={styles.flashcard}>
                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={editQuestion}
                      onChangeText={setEditQuestion}
                    />
                    <TextInput
                      style={styles.input}
                      value={editAnswer}
                      onChangeText={setEditAnswer}
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
                    <Text style={styles.buttonText}>{showAnswer ? "Hide Answer" : "Show Answer"}</Text>
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

        </>
      )}

      {/* TIMER SCREEN */}
      {screen === "timer" && (
        <>
          <TouchableOpacity onPress={() => setScreen("home")}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>⏱ Timer</Text>

          <Text style={styles.timer}>{formatTime(seconds)}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.button} onPress={toggleTimer}>
              <Text style={styles.buttonText}>{isRunning ? "Pause" : "Start"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.reset]} onPress={resetTimer}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* NOTES SCREEN */}
      {screen === "notes" && (
        <>
          <TouchableOpacity onPress={() => setScreen("home")}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>🗒 Notes</Text>

          <Text style={{ fontSize: 20, marginTop: 20 }}>
            Notes page coming soon...
          </Text>
        </>
      )}

    </ScrollView>
  );
}

// -----------------------------
// 🔵 STYLES
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E6F4FE',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },

  // Home screen
  homeContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 80,
  },
  homeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#0B3954',
  },
  homeButton: {
    width: '80%',
    padding: 18,
    backgroundColor: '#0878D0',
    borderRadius: 16,
    marginVertical: 10,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },

  backButton: {
    fontSize: 18,
    color: '#0878D0',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },

  // Shared
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0B3954',
    textAlign: 'center',
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
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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

  // Flashcards
  flashcard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  flashcardButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 20,
    textAlign: 'center',
  },

  // Study Set
  studySetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 15,
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
  deleteButton: {
    backgroundColor: '#FF5C5C',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  // Timer
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
});
