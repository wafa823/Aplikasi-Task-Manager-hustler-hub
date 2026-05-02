import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  auth,
  db,
  APP_ID,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  collection,
  doc,
  setDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
} from '@/lib/firebase';
import { COLORS, Hub, Task, UserProfile } from '@/lib/constants';

import LoadingScreen from '@/components/LoadingScreen';
import AuthScreen from '@/components/AuthScreen';
import OnboardingScreen from '@/components/OnboardingScreen';
import DashboardScreen from '@/components/DashboardScreen';
import HubScreen from '@/components/HubScreen';
import ProfileScreen from '@/components/ProfileScreen';
import TaskModal from '@/components/TaskModal';
import BottomTabBar from '@/components/BottomTabBar';

type ScreenName = 'auth' | 'onboarding' | 'dashboard' | 'hub' | 'profile';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [currentScreen, setCurrentScreen] = useState<ScreenName>('auth');
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // --- AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsLoading(false);
        setCurrentScreen('auth');
      }
    });
    return () => unsubscribe();
  }, []);

  // --- FIRESTORE LISTENERS ---
  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'data');
    const unsubscribeProfile = onSnapshot(
      profileRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
          setCurrentScreen((prev) =>
            prev === 'auth' || prev === 'onboarding' ? 'dashboard' : prev
          );
        } else {
          setProfile(null);
          setCurrentScreen((prev) =>
            prev === 'auth' ? 'onboarding' : prev
          );
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Profile Fetch Error:', error);
        setIsLoading(false);
      }
    );

    const tasksRef = collection(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks');
    const unsubscribeTasks = onSnapshot(
      tasksRef,
      (snapshot) => {
        const taskList: Task[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Task[];
        taskList.sort((a, b) => {
          if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
        setTasks(taskList);
      },
      (error) => console.error('Tasks Fetch Error:', error)
    );

    return () => {
      unsubscribeProfile();
      unsubscribeTasks();
    };
  }, [user]);

  // --- STATS ---
  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.isCompleted).length;
    const pending = tasks.length - completed;
    return { completed, pending, total: tasks.length };
  }, [tasks]);

  // --- AUTH HANDLERS ---
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setAuthError('');
      setIsLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle navigation
      } catch (error: any) {
        console.error('Login Error:', error);
        setAuthError(
          error.code === 'auth/user-not-found'
            ? 'Akun tidak ditemukan.'
            : error.code === 'auth/wrong-password'
            ? 'Password salah.'
            : error.code === 'auth/invalid-email'
            ? 'Format email tidak valid.'
            : 'Login gagal. Silakan coba lagi.'
        );
        setIsLoading(false);
      }
    },
    []
  );

  const handleRegister = useCallback(
    async (email: string, password: string) => {
      setAuthError('');
      if (password.length < 6) {
        setAuthError('Password harus minimal 6 karakter.');
        return;
      }
      setIsLoading(true);
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        setCurrentScreen('onboarding');
      } catch (error: any) {
        console.error('Register Error:', error);
        setAuthError(
          error.code === 'auth/email-already-in-use'
            ? 'Email sudah terdaftar.'
            : 'Pendaftaran gagal. Silakan coba lagi.'
        );
      }
      setIsLoading(false);
    },
    []
  );

  const handleGuestLogin = useCallback(async () => {
    setAuthError('');
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      setCurrentScreen('onboarding');
    } catch (error: any) {
      console.error('Guest Login Error:', error);
      setAuthError('Gagal masuk sebagai tamu.');
    }
    setIsLoading(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentScreen('auth');
      setProfile(null);
      setTasks([]);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  }, []);

  // --- PROFILE ---
  const handleResetProfile = useCallback(async () => {
    if (!user) return;
    try {
      const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'data');
      await deleteDoc(profileRef);
      setCurrentScreen('onboarding');
    } catch (error) {
      console.error('Error resetting profile:', error);
    }
  }, [user]);

  const saveProfile = useCallback(
    async (name: string) => {
      if (!user || !name.trim()) return;
      try {
        const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'data');
        await setDoc(profileRef, {
          name,
          createdAt: new Date().toISOString(),
        });
        setCurrentScreen('dashboard');
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    },
    [user]
  );

  // --- TASKS ---
  const saveTask = useCallback(
    async (taskData: { title: string; category: string; deadline: string }) => {
      if (!user) return;
      try {
        const tasksRef = collection(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks');
        if (editingTask) {
          const taskDoc = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', editingTask.id);
          await updateDoc(taskDoc, {
            ...taskData,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await addDoc(tasksRef, {
            ...taskData,
            isCompleted: false,
            createdAt: new Date().toISOString(),
          });
        }
        setIsTaskModalOpen(false);
        setEditingTask(null);
      } catch (error) {
        console.error('Error saving task:', error);
      }
    },
    [user, editingTask]
  );

  const toggleTaskStatus = useCallback(
    async (taskId: string, currentStatus: boolean) => {
      if (!user) return;
      try {
        const taskDoc = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', taskId);
        await updateDoc(taskDoc, { isCompleted: !currentStatus });
      } catch (error) {
        console.error('Error updating task:', error);
      }
    },
    [user]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!user) return;
      try {
        const taskDoc = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', taskId);
        await deleteDoc(taskDoc);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    },
    [user]
  );

  const handleOpenTaskModal = useCallback((task: Task | null = null) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }, []);

  // --- RENDER ---
  const showBottomBar = !['auth', 'onboarding'].includes(currentScreen) && !isLoading;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          {currentScreen === 'auth' && (
            <AuthScreen
              onLogin={handleLogin}
              onRegister={handleRegister}
              error={authError}
              onGuestLogin={handleGuestLogin}
            />
          )}

          {currentScreen === 'onboarding' && (
            <OnboardingScreen onSave={saveProfile} />
          )}

          {currentScreen === 'dashboard' && (
            <DashboardScreen
              profile={profile}
              tasks={tasks}
              stats={stats}
              onSelectHub={(hub) => {
                setSelectedHub(hub);
                setCurrentScreen('hub');
              }}
            />
          )}

          {currentScreen === 'hub' && selectedHub && (
            <HubScreen
              hub={selectedHub}
              tasks={tasks}
              onBack={() => setCurrentScreen('dashboard')}
              onToggleTask={toggleTaskStatus}
              onDeleteTask={deleteTask}
              onEditTask={handleOpenTaskModal}
              onOpenTaskModal={() => handleOpenTaskModal()}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileScreen
              profile={profile}
              userId={user?.uid}
              stats={stats}
              onLogout={handleLogout}
              onResetProfile={handleResetProfile}
            />
          )}

          {showBottomBar && (
            <BottomTabBar
              currentScreen={currentScreen}
              onNavigate={(screen) => setCurrentScreen(screen as ScreenName)}
              onAddTask={() => handleOpenTaskModal()}
            />
          )}

          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            editingTask={editingTask}
            selectedHubId={selectedHub?.id}
            onSaveTask={saveTask}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
