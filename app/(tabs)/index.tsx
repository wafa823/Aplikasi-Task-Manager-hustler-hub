// app/(tabs)/index.tsx
// Main app entry point — all state, routing, and cross-platform layout here

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform, Animated } from 'react-native';
import { useToast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';

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
import { COLORS, HUBS, Hub, Task, UserProfile, Priority } from '@/lib/constants';

import LoadingScreen from '@/components/LoadingScreen';
import AuthScreen from '@/components/AuthScreen';
import OnboardingScreen from '@/components/OnboardingScreen';
import DashboardScreen from '@/components/DashboardScreen';
import HubScreen from '@/components/HubScreen';
import ProfileScreen from '@/components/ProfileScreen';
import TaskModal from '@/components/TaskModal';
import BottomTabBar from '@/components/BottomTabBar';
import Sidebar from '@/components/Sidebar';

export type ScreenName = 'auth' | 'onboarding' | 'dashboard' | 'hub' | 'profile' | 'loading';

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 1024;
  const toast = useToast();

  // --- STATE ---
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [currentScreen, setCurrentScreen] = useState<ScreenName>('loading');
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);

  const [authError, setAuthError] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // --- SCREEN TRANSITION ANIMATION ---
  const screenFadeAnim = useRef(new Animated.Value(1)).current;
  const screenSlideAnim = useRef(new Animated.Value(0)).current;
  const [displayScreen, setDisplayScreen] = useState<ScreenName>('loading');
  const [displayHub, setDisplayHub] = useState<Hub | null>(null);

  // Prevent onAuthStateChanged from flashing auth screen during intentional login
  const isAuthenticating = useRef(false);

  const activeScreenKey = currentScreen === 'hub' ? `hub-${selectedHub?.id}` : currentScreen;
  const [displayScreenKey, setDisplayScreenKey] = useState(activeScreenKey);

  useEffect(() => {
    if (activeScreenKey !== displayScreenKey) {
      if (
        activeScreenKey === 'loading' ||
        displayScreenKey === 'loading' ||
        isLoggingOut
      ) {
        // If transitioning TO or FROM loading, or cinematic overlay is active, swap instantly
        setDisplayScreen(currentScreen);
        setDisplayHub(selectedHub);
        setDisplayScreenKey(activeScreenKey);
        screenFadeAnim.setValue(1);
        screenSlideAnim.setValue(0);
      } else if (displayScreenKey === 'auth' && activeScreenKey === 'dashboard') {
        // Fast, premium fade-and-lift transition from Auth to Dashboard
        Animated.timing(screenFadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
          setDisplayScreen(currentScreen);
          setDisplayHub(selectedHub);
          setDisplayScreenKey(activeScreenKey);
          screenSlideAnim.setValue(-5); // Very subtle lift
          Animated.parallel([
            Animated.timing(screenFadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.spring(screenSlideAnim, { toValue: 0, tension: 150, friction: 12, useNativeDriver: true })
          ]).start();
        });
      } else {
        // Standard interactive transition for hubs and screens
        Animated.parallel([
          Animated.timing(screenFadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
          Animated.timing(screenSlideAnim, { toValue: 10, duration: 100, useNativeDriver: true })
        ]).start(() => {
          setDisplayScreen(currentScreen);
          setDisplayHub(selectedHub);
          setDisplayScreenKey(activeScreenKey);
          screenSlideAnim.setValue(-10);
          Animated.parallel([
            Animated.timing(screenFadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.spring(screenSlideAnim, { toValue: 0, tension: 120, friction: 14, useNativeDriver: true })
          ]).start();
        });
      }
    }
  }, [activeScreenKey, currentScreen, selectedHub, isLoggingOut]);

  // --- AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser && !isAuthenticating.current) {
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
            prev === 'auth' || prev === 'onboarding' || prev === 'loading' ? 'dashboard' : prev
          );
        } else {
          setProfile(null);
          setCurrentScreen((prev) => (prev === 'auth' || prev === 'loading' ? 'onboarding' : prev));
        }
      },
      (error) => {
        console.error('Profile Fetch Error:', error);
      }
    );

    const tasksRef = collection(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks');
    const unsubscribeTasks = onSnapshot(
      tasksRef,
      (snapshot) => {
        const taskList: Task[] = snapshot.docs.map((d) => ({
          id: d.id,
          priority: 'medium' as Priority,
          notes: '',
          ...d.data(),
        })) as Task[];
        taskList.sort((a, b) => {
          if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
          const pa = a.priority === 'high' ? 0 : a.priority === 'medium' ? 1 : 2;
          const pb = b.priority === 'high' ? 0 : b.priority === 'medium' ? 1 : 2;
          if (pa !== pb) return pa - pb;
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

  // --- STATS & HUBS ---
  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.isCompleted).length;
    const pending = tasks.length - completed;
    return { completed, pending, total: tasks.length };
  }, [tasks]);

  const allHubs = useMemo(() => {
    return [...HUBS, ...(profile?.customHubs || [])];
  }, [profile?.customHubs]);

  const handleCreateHub = async (newHub: Hub) => {
    if (!user || !profile) return;
    try {
      const updatedHubs = [...(profile.customHubs || []), newHub];
      await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'data'), {
        customHubs: updatedHubs
      });
    } catch (error) {
      console.error('Error creating custom hub:', error);
      toast.error('Gagal membuat list', 'Silakan coba lagi.');
    }
  };

  const handleDeleteHub = async (hubId: string) => {
    if (!user || !profile || !profile.customHubs) return;
    try {
      const updatedHubs = profile.customHubs.filter(h => h.id !== hubId);
      await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'data'), {
        customHubs: updatedHubs
      });
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Error deleting custom hub:', error);
      toast.error('Gagal menghapus list', 'Silakan coba lagi.');
    }
  };

  // --- AUTH HANDLERS ---
  const handleLogin = useCallback(async (email: string, password: string) => {
    setAuthError('');
    isAuthenticating.current = true;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setCurrentScreen('auth');
      const msg =
        error.code === 'auth/user-not-found' ? 'Akun tidak ditemukan.' :
          error.code === 'auth/wrong-password' ? 'Password salah.' :
            error.code === 'auth/invalid-email' ? 'Format email tidak valid.' :
              'Login gagal. Silakan coba lagi.';
      setAuthError(msg);
      toast.error('Login gagal', msg);
    } finally {
      isAuthenticating.current = false;
    }
  }, [toast]);

  const handleRegister = useCallback(async (email: string, password: string) => {
    setAuthError('');
    if (password.length < 6) {
      setAuthError('Password harus minimal 6 karakter.');
      toast.error('Password terlalu pendek', 'Minimal 6 karakter.');
      return;
    }
    isAuthenticating.current = true;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Let onSnapshot change it to onboarding
    } catch (error: any) {
      setCurrentScreen('auth');
      const msg =
        error.code === 'auth/email-already-in-use' ? 'Email sudah terdaftar.' :
          'Pendaftaran gagal. Silakan coba lagi.';
      setAuthError(msg);
      toast.error('Registrasi gagal', msg);
    } finally {
      isAuthenticating.current = false;
    }
  }, [toast]);

  const handleGuestLogin = useCallback(async () => {
    setAuthError('');
    isAuthenticating.current = true;
    try {
      await signInAnonymously(auth);
      // Let onSnapshot change it to onboarding
    } catch (error: any) {
      setCurrentScreen('auth');
      setAuthError('Gagal masuk sebagai tamu.');
      toast.error('Gagal masuk', 'Tidak bisa masuk sebagai tamu.');
    } finally {
      isAuthenticating.current = false;
    }
  }, [toast]);

  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start(async () => {
      try {
        await signOut(auth);
        setCurrentScreen('auth');
        setProfile(null);
        setTasks([]);
      } catch (error) {
        console.error('Logout Error:', error);
      } finally {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }).start(() => setIsLoggingOut(false));
      }
    });
  }, [fadeAnim]);

  // --- PROFILE ---
  const handleResetProfile = useCallback(async () => {
    if (!user) return;
    try {
      const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'data');
      await deleteDoc(profileRef);
      setCurrentScreen('onboarding');
    } catch (error) { console.error('Error resetting profile:', error); }
  }, [user]);

  const saveProfile = useCallback((name: string) => {
    if (!user || !name.trim()) return;
    // Activate overlay for luxurious transition
    setIsLoggingOut(true); // Reusing the overlay state
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500, // Slower fade out for dramatic effect
      useNativeDriver: true,
    }).start(async () => {
      try {
        const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'data');
        await setDoc(profileRef, { name, createdAt: new Date().toISOString() });
        setCurrentScreen('dashboard');
      } catch (error) {
        console.error('Error saving profile:', error);
        toast.error('Gagal menyimpan profil', 'Silakan coba lagi.');
      } finally {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 700, // Very slow and smooth reveal of the dashboard
          useNativeDriver: true,
        }).start(() => setIsLoggingOut(false));
      }
    });
  }, [user, fadeAnim, toast]);

  // --- TASKS ---
  const saveTask = useCallback(
    async (taskData: { title: string; notes: string; category: string; deadline: string; priority: Priority }) => {
      if (!user) return;
      try {
        const tasksRef = collection(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks');
        if (editingTask) {
          const taskDoc = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', editingTask.id);
          await updateDoc(taskDoc, { ...taskData, updatedAt: new Date().toISOString() });
        } else {
          await addDoc(tasksRef, { ...taskData, isCompleted: false, createdAt: new Date().toISOString() });
        }
        setIsTaskModalOpen(false);
        setEditingTask(null);
      } catch (error) {
        console.error('Error saving task:', error);
        toast.error('Gagal menyimpan tugas', 'Silakan coba lagi.');
      }
    },
    [user, editingTask, toast]
  );

  const toggleTaskStatus = useCallback(async (taskId: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      const taskDoc = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', taskId);
      await updateDoc(taskDoc, { isCompleted: !currentStatus });
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Gagal memperbarui status tugas');
    }
  }, [user, toast]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!user) return;
    try {
      const taskDoc = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'tasks', taskId);
      await deleteDoc(taskDoc);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Gagal menghapus tugas');
    }
  }, [user, toast]);

  const handleOpenTaskModal = useCallback((task: Task | null = null) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }, []);

  const handleSelectHub = useCallback((hub: Hub) => {
    setSelectedHub(hub);
    setCurrentScreen('hub');
  }, []);

  // --- SCREEN RENDERER ---
  const renderScreen = () => {
    switch (displayScreen) {
      case 'loading':
        return <LoadingScreen />;
      case 'auth':
        return (
          <AuthScreen
            onLogin={handleLogin}
            onRegister={handleRegister}
            error={authError}
            onGuestLogin={handleGuestLogin}
          />
        );
      case 'onboarding':
        return <OnboardingScreen onSave={saveProfile} />;
      case 'dashboard':
        return (
          <DashboardScreen
            profile={profile}
            tasks={tasks}
            stats={stats}
            allHubs={allHubs}
            onSelectHub={handleSelectHub}
            onAddTask={() => handleOpenTaskModal()}
            onCreateHub={handleCreateHub}
            onEditTask={handleOpenTaskModal}
          />
        );
      case 'hub':
        return displayHub ? (
          <HubScreen
            hub={displayHub}
            tasks={tasks}
            onBack={() => setCurrentScreen('dashboard')}
            onToggleTask={toggleTaskStatus}
            onDeleteTask={deleteTask}
            onEditTask={handleOpenTaskModal}
            onOpenTaskModal={() => handleOpenTaskModal()}
            onDeleteHub={handleDeleteHub}
          />
        ) : null;
      case 'profile':
        return (
          <ProfileScreen
            profile={profile}
            userId={user?.uid}
            userEmail={user?.email || ''}
            stats={stats}
            onLogout={handleLogout}
            onResetProfile={handleResetProfile}
          />
        );
      default:
        return null;
    }
  };

  const isAuthScreen = displayScreen === 'auth' || displayScreen === 'onboarding' || displayScreen === 'loading';
  const showSidebar = isDesktop && !isAuthScreen;
  const showBottomBar = !isDesktop && !isAuthScreen;

  // --- UNIFIED LAYOUT ---
  const renderContent = () => {
    return (
      <LinearGradient
        colors={showSidebar ? ['#020617', '#0a1020', '#0f172a'] : [COLORS.bg, COLORS.bg]}
        style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column' }}
      >
        {showSidebar && (
          <Sidebar
            currentScreen={currentScreen as any}
            selectedHub={selectedHub}
            profile={profile}
            tasks={tasks}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onSelectHub={handleSelectHub}
            onLogout={handleLogout}
            onAddTask={() => handleOpenTaskModal()}
            allHubs={allHubs}
            onCreateHub={handleCreateHub}
            userEmail={user?.email || ''}
          />
        )}

        <View style={{ flex: 1, overflow: 'hidden', backgroundColor: 'transparent' }}>
          <Animated.View style={{ flex: 1, opacity: screenFadeAnim, transform: [{ translateY: screenSlideAnim }] }}>
            {renderScreen()}
          </Animated.View>
        </View>

        {showBottomBar && (
          <BottomTabBar
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen as ScreenName)}
            onAddTask={() => handleOpenTaskModal()}
          />
        )}

        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
          editingTask={editingTask}
          selectedHubId={selectedHub?.id}
          onSaveTask={saveTask}
        />
      </LinearGradient>
    );
  };

  return (
    <>
      {renderContent()}
      <Animated.View
        pointerEvents={isLoggingOut ? 'auto' : 'none'}
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: COLORS.bg, opacity: fadeAnim, zIndex: 99999 }
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  desktopRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopMain: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  mobileRoot: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
