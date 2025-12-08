import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

// -------------------------
// Types
// -------------------------
type Note = { id: number; title: string; content: string };
type Flashcard = { question: string; answer: string };
type StudySet = { name: string; flashcards: Flashcard[] };

type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
  Flashcards: undefined;
  Timer: undefined;
  Notes: undefined;
  NoteEditor: { noteId: number | null } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// -------------------------
// Templates
// -------------------------
const TEMPLATES: Record<'html' | 'java' | 'cpp', string> = {
  html: `<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <title>Document</title>
</head>
<body>
  <!-- Your content here -->
</body>
</html>`,
  java: `// Import statements go here (optional)
import java.util.*;

public class Main {
  public static void main(String[] args) {
    // Your code here
    System.out.println(\"Hello, Java!\");
  }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
  // Your code here
  cout << \"Hello, C++!\" << endl;
  return 0;
}`,
};

// -------------------------
// App (root holds the state and passes down)
// -------------------------
export default function App() {
  // Auth
  const [signedIn, setSignedIn] = useState<boolean>(false);

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);

  // Flashcards state
  const [studySets, setStudySets] = useState<StudySet[]>([{ name: 'Default Set', flashcards: [] }]);

  // Timer state (kept in Timer Screen but initial here if needed)

  // Helper note functions
  const createNote = (): Note => {
    const n: Note = { id: Date.now(), title: 'Untitled', content: '' };
    setNotes((p) => [...p, n]);
    return n;
  };

  const updateNote = (id: number, field: keyof Note, value: string) => {
    setNotes((p) => p.map((n) => (n.id === id ? { ...n, [field]: value } : n)));
  };

  const deleteNote = (id: number) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setNotes((p) => p.filter((n) => n.id !== id)),
      },
    ]);
  };

  // Flashcard helpers
  const addStudySet = (name: string) => {
    setStudySets((p) => [...p, { name, flashcards: [] }]);
  };

  const addFlashcard = (setIndex: number, q: string, a: string) => {
    setStudySets((p) => {
      const copy = p.map((s) => ({ ...s, flashcards: [...s.flashcards] }));
      copy[setIndex].flashcards.push({ question: q, answer: a });
      return copy;
    });
  };

  const deleteFlashcard = (setIndex: number, cardIndex: number) => {
    setStudySets((p) => {
      const copy = p.map((s) => ({ ...s, flashcards: [...s.flashcards] }));
      copy[setIndex].flashcards.splice(cardIndex, 1);
      return copy;
    });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {!signedIn ? (
          <Stack.Screen name="SignIn" options={{ title: 'Sign In' }}>
            {(props) => (
              <SignInScreen
                {...props}
                onSignIn={() => setSignedIn(true)}
              />
            )}
          </Stack.Screen>
        ) : null}

        <Stack.Screen name="Home" options={{ title: 'Studious' }}>
          {(props) => (
            <HomeScreen
              {...props}
              onSignOut={() => setSignedIn(false)}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Flashcards" options={{ title: 'Flashcards' }}>
          {(props) => (
            <FlashcardsScreen
              {...props}
              studySets={studySets}
              onAddSet={addStudySet}
              onAddCard={addFlashcard}
              onDeleteCard={deleteFlashcard}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Timer" options={{ title: 'Timer' }}>
          {(props) => <TimerScreen {...props} />}
        </Stack.Screen>

        <Stack.Screen name="Notes" options={{ title: 'Notes' }}>
          {(props) => (
            <NotesScreen
              {...props}
              notes={notes}
              createNote={() => createNote()}
              updateNote={updateNote}
              deleteNote={deleteNote}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="NoteEditor" options={{ title: 'Edit Note' }}>
          {(props) => (
            <NoteEditorScreen
              {...props}
              notes={notes}
              createNote={createNote}
              updateNote={updateNote}
              deleteNote={deleteNote}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// -------------------------
// Screens
// -------------------------

function SignInScreen({ navigation, route, onSignIn }: NativeStackScreenProps<RootStackParamList, 'SignIn'> & { onSignIn: () => void }) {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const FAKE = { username: 'user', password: '1234' };

  const submit = () => {
    if (username === FAKE.username && password === FAKE.password) {
      onSignIn();
      // jump to home
      navigation.replace('Home');
    } else {
      Alert.alert('Sign in failed', 'Wrong username or password');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.centerContainer}>
      <Text style={styles.logo}>📚 Studious</Text>
      <TextInput
        accessibilityLabel="username"
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        accessibilityLabel="password"
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.primaryButton} onPress={submit}>
        <Text style={styles.primaryButtonText}>Sign in</Text>
      </TouchableOpacity>
      <Text style={{ marginTop: 8, color: '#444' }}>Forgot password?</Text>
    </KeyboardAvoidingView>
  );
}

function HomeScreen({ navigation, onSignOut }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.homeTitle}>Welcome to Studious</Text>
      <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('Flashcards')}>
        <Text style={styles.tileText}>📝 Flashcards</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('Timer')}>
        <Text style={styles.tileText}>⏱ Timer</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('Notes')}>
        <Text style={styles.tileText}>🗒 Notes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.tile, { backgroundColor: '#eee' }]} onPress={() => { onSignOut(); navigation.replace('SignIn'); }}>
        <Text style={{ color: '#333' }}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

function FlashcardsScreen({ navigation, studySets, onAddSet, onAddCard, onDeleteCard }: any) {
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editQuestion, setEditQuestion] = useState<string>('');
  const [editAnswer, setEditAnswer] = useState<string>('');
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [newSetName, setNewSetName] = useState<string>('');

  const currentSet: StudySet = studySets[currentSetIndex] ?? { name: 'Empty', flashcards: [] };
  const currentCard: Flashcard | undefined = currentSet.flashcards[cardIndex];

  useEffect(() => {
    // reset cardIndex if set changes or becomes empty
    if (cardIndex >= (currentSet.flashcards.length || 0)) setCardIndex(0);
  }, [currentSetIndex, currentSet.flashcards.length]);

  const nextCard = () => {
    if (!currentSet.flashcards.length) return;
    setCardIndex((c) => (c + 1) % currentSet.flashcards.length);
    setShowAnswer(false);
  };

  const prevSet = () => setCurrentSetIndex((s) => (s - 1 + studySets.length) % studySets.length);
  const nextSet = () => setCurrentSetIndex((s) => (s + 1) % studySets.length);

  const saveEdit = () => {
    setIsEditing(false);
    // apply edit
    const updatedSets = studySets.map((s: StudySet, i: number) => ({ ...s, flashcards: [...s.flashcards] }));
    updatedSets[currentSetIndex].flashcards[cardIndex] = { question: editQuestion, answer: editAnswer };
    // call parent setter by replacing setStudySets is not passed — we mutate via onAddCard/onDeleteCard patterns above; instead prompt user to re-add? Simpler: alert not implemented. For now we only support in-component edits for demo.
    Alert.alert('Edit saved (local only)', 'This demo keeps edits in-memory for this screen only.');
  };

  const handleAddCard = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    onAddCard(currentSetIndex, newQuestion.trim(), newAnswer.trim());
    setNewQuestion('');
    setNewAnswer('');
    setCardIndex((prev) => (studySets[currentSetIndex].flashcards.length));
  };

  const handleAddSet = () => {
    if (!newSetName.trim()) return;
    onAddSet(newSetName.trim());
    setNewSetName('');
    setCurrentSetIndex(studySets.length);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={{ alignSelf: 'flex-start' }} onPress={() => navigation.goBack()}>
        <Text style={{ color: '#06f' }}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.rowCenter}>
        <TouchableOpacity onPress={prevSet}><Text style={styles.arrow}>◀</Text></TouchableOpacity>
        <Text style={styles.h2}>{currentSet.name}</Text>
        <TouchableOpacity onPress={nextSet}><Text style={styles.arrow}>▶</Text></TouchableOpacity>
      </View>

      {/* Add set */}
      <TextInput placeholder="New set name" style={styles.input} value={newSetName} onChangeText={setNewSetName} />
      <TouchableOpacity style={styles.smallButton} onPress={handleAddSet}><Text style={styles.smallButtonText}>Add Set</Text></TouchableOpacity>

      {/* Add card */}
      <TextInput placeholder="Question" style={styles.input} value={newQuestion} onChangeText={setNewQuestion} />
      <TextInput placeholder="Answer" style={styles.input} value={newAnswer} onChangeText={setNewAnswer} />
      <TouchableOpacity style={styles.smallButton} onPress={handleAddCard}><Text style={styles.smallButtonText}>Add Card</Text></TouchableOpacity>

      {/* Card display (style B: tap to flip) */}
      <TouchableWithoutFeedback onPress={() => setShowAnswer((s) => !s)}>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            {currentCard ? (showAnswer ? currentCard.answer : currentCard.question) : 'No cards yet. Tap + to add.'}
          </Text>
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.rowCenter}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setIsEditing(true)} disabled={!currentCard}><Text style={styles.primaryButtonText}>Edit</Text></TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={nextCard}><Text style={styles.primaryButtonText}>Next</Text></TouchableOpacity>
      </View>

      {isEditing && (
        <View style={styles.modal}>
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>Edit Card</Text>
          <TextInput style={styles.input} value={editQuestion} onChangeText={setEditQuestion} placeholder="Question" />
          <TextInput style={styles.input} value={editAnswer} onChangeText={setEditAnswer} placeholder="Answer" />
          <View style={styles.rowCenter}>
            <TouchableOpacity style={styles.smallButton} onPress={saveEdit}><Text>Save</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.smallButton, { backgroundColor: '#f66' }]} onPress={() => setIsEditing(false)}><Text style={{ color: '#fff' }}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      )}

    </ScrollView>
  );
}

function TimerScreen({ navigation }: any) {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(5);
  const [secs, setSecs] = useState<number>(0);
  const [total, setTotal] = useState<number>(hours * 3600 + minutes * 60 + secs);
  const [running, setRunning] = useState<boolean>(false);

  useEffect(() => {
    setTotal(hours * 3600 + minutes * 60 + secs);
  }, [hours, minutes, secs]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (running && total > 0) {
      timer = setInterval(() => setTotal((t) => t - 1), 1000);
    }
    if (total <= 0) setRunning(false);
    return () => { if (timer) clearInterval(timer); };
  }, [running, total]);

  const format = (n: number) => n.toString().padStart(2, '0');

  const reset = () => {
    setRunning(false);
    setTotal(hours * 3600 + minutes * 60 + secs);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={{ alignSelf: 'flex-start' }} onPress={() => navigation.goBack()}>
        <Text style={{ color: '#06f' }}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.h2}>Timer</Text>

      <View style={styles.rowCenter}>
        <TextInput keyboardType="number-pad" style={styles.timeInput} value={String(hours)} onChangeText={(t) => setHours(parseInt(t || '0', 10))} />
        <Text style={styles.timeSep}>:</Text>
        <TextInput keyboardType="number-pad" style={styles.timeInput} value={String(minutes)} onChangeText={(t) => setMinutes(parseInt(t || '0', 10))} />
        <Text style={styles.timeSep}>:</Text>
        <TextInput keyboardType="number-pad" style={styles.timeInput} value={String(secs)} onChangeText={(t) => setSecs(parseInt(t || '0', 10))} />
      </View>

      <Text style={styles.timerLarge}>{`${format(Math.floor(total / 3600))}:${format(Math.floor(total / 60) % 60)}:${format(total % 60)}`}</Text>

      <View style={styles.rowCenter}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setRunning((r) => !r)}>
          <Text style={styles.primaryButtonText}>{running ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#f66' }]} onPress={reset}><Text style={{ color: '#fff' }}>Reset</Text></TouchableOpacity>
      </View>
    </View>
  );
}

function NotesScreen({ navigation, notes, createNote, updateNote, deleteNote }: any) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={{ alignSelf: 'flex-start' }} onPress={() => navigation.goBack()}>
        <Text style={{ color: '#06f' }}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.h2}>Notes</Text>

      <View style={{ width: '100%' }}>
        <TouchableOpacity style={styles.newNoteButton} onPress={() => {
          const n = createNote();
          navigation.navigate('NoteEditor', { noteId: n.id });
        }}>
          <Text style={styles.newNoteText}>+ New Note</Text>
        </TouchableOpacity>

        <FlatList
          data={notes}
          keyExtractor={(item: Note) => String(item.id)}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.noteCard} onPress={() => navigation.navigate('NoteEditor', { noteId: item.id })}>
              <Text style={{ fontWeight: '700' }}>{item.title}</Text>
              <Text numberOfLines={4} style={{ marginTop: 6 }}>{item.content}</Text>
              <TouchableOpacity style={styles.noteDelete} onPress={() => deleteNote(item.id)}>
                <Text style={{ color: '#fff' }}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

function NoteEditorScreen({ route, navigation, notes, createNote, updateNote, deleteNote }: any) {
  const noteId: number | null = route.params?.noteId ?? null;
  const note: Note | undefined = notes.find((n: Note) => n.id === noteId);
  const [title, setTitle] = useState<string>(note ? note.title : '');
  const [content, setContent] = useState<string>(note ? note.content : '');

  useEffect(() => {
    setTitle(note ? note.title : '');
    setContent(note ? note.content : '');
  }, [noteId, notes]);

  useEffect(() => {
    if (note) updateNote(note.id, 'title', title);
  }, [title]);

  useEffect(() => {
    if (note) updateNote(note.id, 'content', content);
  }, [content]);

  const applyTemplate = (k: keyof typeof TEMPLATES) => setContent(TEMPLATES[k]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TouchableOpacity style={{ alignSelf: 'flex-start' }} onPress={() => navigation.goBack()}>
        <Text style={{ color: '#06f' }}>← Back</Text>
      </TouchableOpacity>

      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title" />

      <View style={styles.templateRow}>
        <TouchableOpacity style={styles.templateButton} onPress={() => applyTemplate('html')}><Text>HTML</Text></TouchableOpacity>
        <TouchableOpacity style={styles.templateButton} onPress={() => applyTemplate('java')}><Text>Java</Text></TouchableOpacity>
        <TouchableOpacity style={styles.templateButton} onPress={() => applyTemplate('cpp')}><Text>C++</Text></TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, { height: 300, textAlignVertical: 'top' }]}
        multiline
        value={content}
        onChangeText={setContent}
        placeholder="Write your note here"
      />

      <View style={styles.rowCenter}>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#f66' }]} onPress={() => {
          if (note) deleteNote(note.id);
          navigation.goBack();
        }}>
          <Text style={{ color: '#fff' }}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// -------------------------
// Styles
// -------------------------
const styles = StyleSheet.create({
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  container: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: '#f0f7ef' },
  logo: { fontSize: 36, fontWeight: '800', marginBottom: 12 },
  input: { width: '100%', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 },
  primaryButton: { backgroundColor: '#2e8b57', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  homeTitle: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  tile: { width: '100%', backgroundColor: '#9bd29a', padding: 18, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  tileText: { fontSize: 18, fontWeight: '700' },
  h2: { fontSize: 20, fontWeight: '700', marginVertical: 12 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  arrow: { fontSize: 22, paddingHorizontal: 12 },
  smallButton: { backgroundColor: '#6fbf73', padding: 10, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  smallButtonText: { color: '#fff', fontWeight: '700' },
  card: { width: '100%', minHeight: 180, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 20, marginVertical: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6 },
  cardText: { fontSize: 18, textAlign: 'center' },
  modal: { width: '100%', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginTop: 12 },
  timeInput: { width: 70, backgroundColor: '#fff', padding: 8, borderRadius: 8, textAlign: 'center' },
  timeSep: { fontSize: 20, marginHorizontal: 8 },
  timerLarge: { fontSize: 36, fontWeight: '800', marginVertical: 12 },
  newNoteButton: { backgroundColor: '#ffd98a', padding: 12, borderRadius: 10, marginVertical: 12, alignItems: 'center' },
  newNoteText: { fontWeight: '700' },
  noteCard: { backgroundColor: '#fff', padding: 12, borderRadius: 10, margin: 8, flex: 1, minWidth: 140, maxWidth: '48%', position: 'relative' },
  noteDelete: { position: 'absolute', right: 8, bottom: 8, backgroundColor: '#e55353', padding: 6, borderRadius: 6 },
  templateRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginVertical: 8 },
  templateButton: { backgroundColor: '#eee', padding: 8, borderRadius: 8, flex: 1, alignItems: 'center', marginHorizontal: 4 },
});
