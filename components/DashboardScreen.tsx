// components/DashboardScreen.tsx
// Upgraded dashboard with Bento Grid (desktop) and card layout (mobile)

import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Circle } from 'react-native-svg';
import { COLORS, HUBS, Hub, Task, UserProfile, getGreeting, PRIORITY_COLORS, Priority, getDeadlineStatus } from '@/lib/constants';
import CreateHubModal from '@/components/CreateHubModal';

const AnimatedButton = ({ children, onPress, style, activeOpacity, ...props }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 150, friction: 10 }).start();
        if (activeOpacity) {
          Animated.timing(opacity, { toValue: activeOpacity, duration: 100, useNativeDriver: true }).start();
        }
      }}
      onPressOut={() => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 150, friction: 10 }).start();
        if (activeOpacity) {
          Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
        }
      }}
      {...props}
    >
      <Animated.View style={[style, { transform: [{ scale }], opacity }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

type TabType = 'Hari Ini' | 'Mendatang' | 'Terlambat' | 'Selesai';

interface DashboardScreenProps {
  profile: UserProfile | null;
  tasks: Task[];
  stats: { completed: number; pending: number; total: number };
  allHubs: Hub[];
  onSelectHub: (hub: Hub) => void;
  onAddTask: () => void;
  onCreateHub: (hub: Hub) => void;
  onEditTask?: (task: Task) => void;
  onToggleTask?: (taskId: string, currentStatus: boolean) => void;
  onDeleteTask?: (taskId: string) => void;
}

function ProgressRing({ completed, total, size = 56 }: { completed: number; total: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? (completed / total) : 0;
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={COLORS.border} strokeWidth={4} fill="none"
      />
      <Circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={COLORS.amber} strokeWidth={4} fill="none"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

export default function DashboardScreen({
  profile,
  tasks,
  stats,
  allHubs,
  onSelectHub,
  onAddTask,
  onCreateHub,
  onEditTask,
  onToggleTask,
  onDeleteTask,
}: DashboardScreenProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 1024;
  const progressPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const workspaces = useMemo(() => allHubs.filter(h => h.type !== 'checklist'), [allHubs]);
  const checklists = useMemo(() => allHubs.filter(h => h.type === 'checklist'), [allHubs]);

  // --- SPLIT STATS ---
  const workspaceIds = useMemo(() => new Set(workspaces.map(h => h.id)), [workspaces]);
  const checklistIds = useMemo(() => new Set(checklists.map(h => h.id)), [checklists]);

  const wsStats = useMemo(() => {
    const wsTasks = tasks.filter(t => workspaceIds.has(t.category));
    const completed = wsTasks.filter(t => t.isCompleted).length;
    return { completed, pending: wsTasks.length - completed, total: wsTasks.length };
  }, [tasks, workspaceIds]);

  const clStats = useMemo(() => {
    const clTasks = tasks.filter(t => checklistIds.has(t.category));
    const completed = clTasks.filter(t => t.isCompleted).length;
    return { completed, pending: clTasks.length - completed, total: clTasks.length };
  }, [tasks, checklistIds]);

  const wsPct = wsStats.total > 0 ? Math.round((wsStats.completed / wsStats.total) * 100) : 0;
  const clPct = clStats.total > 0 ? Math.round((clStats.completed / clStats.total) * 100) : 0;

  const [activeTab, setActiveTab] = React.useState<TabType>('Hari Ini');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isHubModalOpen, setIsHubModalOpen] = React.useState(false);
  // --- NOTIFICATIONS (TEMPORARILY DISABLED) ---
  const renderBellButton = () => null;

  const filteredTasks = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      ).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    return tasks.filter((t) => {
      const d = new Date(t.deadline);
      if (activeTab === 'Selesai') return t.isCompleted;
      if (t.isCompleted) return false; // Other tabs don't show completed

      if (activeTab === 'Terlambat') return d < now;
      if (activeTab === 'Hari Ini') return d >= todayStart && d < tomorrowStart;
      if (activeTab === 'Mendatang') return d >= tomorrowStart;
      return false;
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks, activeTab, searchQuery]);

  const renderTabsAndTasks = () => {
    const isSearching = searchQuery.trim().length > 0;

    return (
      <View style={styles.tasksSection}>
        {!isSearching && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {(['Hari Ini', 'Mendatang', 'Terlambat', 'Selesai'] as TabType[]).map((tab) => {
              const isActive = activeTab === tab;
              let icon = 'calendar';
              let activeColor = COLORS.amber;
              if (tab === 'Hari Ini') { icon = 'zap'; activeColor = COLORS.amber; }
              if (tab === 'Mendatang') { icon = 'calendar'; activeColor = COLORS.blue; }
              if (tab === 'Terlambat') { icon = 'alert-circle'; activeColor = '#EF4444'; }
              if (tab === 'Selesai') { icon = 'check-circle'; activeColor = COLORS.green; }

              return (
                <AnimatedButton
                  key={tab}
                  style={[styles.tabButton, isActive && { backgroundColor: activeColor + '15', borderColor: activeColor }]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Feather name={icon as any} size={14} color={isActive ? activeColor : COLORS.textDim} />
                  <Text style={[styles.tabText, isActive && { color: activeColor, fontWeight: '600' }]}>{tab}</Text>
                </AnimatedButton>
              );
            })}
          </ScrollView>
        )}

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name={isSearching ? "search" : "inbox"} size={32} color={COLORS.border} />
            <Text style={styles.emptyText}>
              {isSearching ? `Tidak ada hasil untuk "${searchQuery}"` : `Tidak ada tugas ${activeTab.toLowerCase()}`}
            </Text>
          </View>
        ) : (
          <View style={styles.urgentList}>
            {filteredTasks.map((task) => {
              const hub = allHubs.find((h) => h.id === task.category);
              return (
                <View
                  key={task.id}
                  style={[styles.urgentItem, { borderLeftColor: hub?.color || COLORS.amber }]}
                >
                  {/* Left: Complete/Pending Checkbox */}
                  {onToggleTask && (
                    <TouchableOpacity
                      onPress={() => onToggleTask(task.id, task.isCompleted)}
                      style={styles.taskCheckbox}
                      activeOpacity={0.7}
                    >
                      <Feather
                        name={task.isCompleted ? 'check-circle' : 'circle'}
                        size={18}
                        color={task.isCompleted ? COLORS.green : COLORS.textDim}
                      />
                    </TouchableOpacity>
                  )}

                  {/* Middle: Title, Category, Deadline */}
                  <TouchableOpacity
                    style={{ flex: 1, paddingHorizontal: 8 }}
                    onPress={() => {
                      if (hub) onSelectHub(hub);
                    }}
                    activeOpacity={hub ? 0.7 : 1}
                  >
                    <Text style={[styles.urgentTitle, task.isCompleted && styles.completedText]} numberOfLines={1}>
                      {task.title}
                    </Text>
                    <Text style={styles.urgentMeta} numberOfLines={1}>
                      {hub ? hub.title : 'Kategori tidak dikenal'} · {new Date(task.deadline).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':')} WIB
                    </Text>
                  </TouchableOpacity>

                  {/* Right: Actions (Edit & Delete) */}
                  <View style={styles.taskActions}>
                    {onEditTask && (
                      <TouchableOpacity
                        onPress={() => onEditTask(task)}
                        style={styles.taskActionBtn}
                        activeOpacity={0.7}
                      >
                        <Feather name="edit-2" size={14} color={COLORS.textDim} />
                      </TouchableOpacity>
                    )}
                    {onDeleteTask && (
                      <TouchableOpacity
                        onPress={() => onDeleteTask(task.id)}
                        style={styles.taskActionBtn}
                        activeOpacity={0.7}
                      >
                        <Feather name="trash-2" size={14} color={COLORS.red} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Feather name="search" size={18} color={COLORS.textDim} />
      <TextInput
        style={[styles.searchInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
        placeholder="Cari tugas atau catatan..."
        placeholderTextColor={COLORS.textDim}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <AnimatedButton onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
          <Feather name="x" size={16} color={COLORS.textDim} />
        </AnimatedButton>
      )}
    </View>
  );

  if (isDesktop) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.desktopContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.desktopHeader}>
          <View>
            <Text style={styles.userName}>Halo {profile?.name || 'Hustler'} 👋</Text>
            <Text style={styles.headerSubtitle}>Apa yang ingin kamu selesaikan hari ini?</Text>
          </View>
          <View style={styles.headerActions}>
            {renderBellButton()}
            <AnimatedButton style={styles.addButton} onPress={onAddTask} activeOpacity={0.8}>
              <Feather name="plus" size={16} color={COLORS.bg} />
              <Text style={styles.addButtonText}>Tambah Tugas</Text>
            </AnimatedButton>
          </View>
        </View>

        {/* Bento Grid Row 1 — Split Stats */}
        <View style={styles.bentoRow}>
          {/* Workspace Stats Card */}
          <View style={[styles.bentoCard, { flex: 1, minHeight: 120, justifyContent: 'space-between', overflow: 'hidden' }]}>
            <LinearGradient
              colors={['rgba(59,130,246,0.10)', 'rgba(168,85,247,0.06)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.statIconWrap, { backgroundColor: COLORS.blueLight, width: 24, height: 24, borderRadius: 6 }]}>
                  <Feather name="layers" size={12} color={COLORS.blue} />
                </View>
                <Text style={styles.bentoCardLabel}>WORKSPACES</Text>
              </View>
              <ProgressRing completed={wsStats.completed} total={wsStats.total} size={38} />
            </View>
            <Text style={[styles.bigNumber, { fontSize: 28, color: COLORS.blue }]}>{wsPct}%</Text>
            <Text style={styles.progressSubtext}>{wsStats.completed} dari {wsStats.total} selesai</Text>
            <View style={[styles.progressBarBg, { marginTop: 10 }]}>
              <View style={[styles.progressBarFill, { width: `${wsPct}%` as any, backgroundColor: COLORS.blue }]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="clock" size={10} color={COLORS.blue} />
                <Text style={{ color: COLORS.textDim, fontSize: 10 }}>{wsStats.pending} pending</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="check" size={10} color={COLORS.green} />
                <Text style={{ color: COLORS.textDim, fontSize: 10 }}>{wsStats.completed} selesai</Text>
              </View>
            </View>
          </View>

          {/* Checklist Stats Card */}
          <View style={[styles.bentoCard, { flex: 1, minHeight: 120, justifyContent: 'space-between', overflow: 'hidden' }]}>
            <LinearGradient
              colors={['rgba(34,197,94,0.10)', 'rgba(245,158,11,0.06)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.statIconWrap, { backgroundColor: COLORS.greenLight, width: 24, height: 24, borderRadius: 6 }]}>
                  <Feather name="check-square" size={12} color={COLORS.green} />
                </View>
                <Text style={styles.bentoCardLabel}>CHECKLIST</Text>
              </View>
              <ProgressRing completed={clStats.completed} total={clStats.total} size={38} />
            </View>
            <Text style={[styles.bigNumber, { fontSize: 28, color: COLORS.green }]}>{clPct}%</Text>
            <Text style={styles.progressSubtext}>
              {checklists.length === 0 ? 'Belum ada checklist' : `${clStats.completed} dari ${clStats.total} selesai`}
            </Text>
            <View style={[styles.progressBarBg, { marginTop: 10 }]}>
              <View style={[styles.progressBarFill, { width: `${clPct}%` as any, backgroundColor: COLORS.green }]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="clock" size={10} color={COLORS.amber} />
                <Text style={{ color: COLORS.textDim, fontSize: 10 }}>{clStats.pending} tersisa</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="check" size={10} color={COLORS.green} />
                <Text style={{ color: COLORS.textDim, fontSize: 10 }}>{clStats.completed} selesai</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Workspaces */}
        <Text style={styles.sectionTitle}>Workspaces</Text>
        <View style={styles.hubGrid}>
          {workspaces.map((hub) => {
            const active = tasks.filter((t) => t.category === hub.id && !t.isCompleted).length;
            const total = tasks.filter((t) => t.category === hub.id).length;
            const done = tasks.filter((t) => t.category === hub.id && t.isCompleted).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <AnimatedButton
                key={hub.id}
                style={[styles.hubCard, { borderColor: hub.borderColor }]}
                onPress={() => onSelectHub(hub)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[hub.bgColor, 'transparent']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.hubCardRow}>
                  {/* Left: Icon and Title/Subtitle */}
                  <View style={styles.hubCardLeft}>
                    <View style={[styles.hubIconBox, { backgroundColor: hub.glowColor }]}>
                      <Feather name={hub.iconName as any} size={18} color={hub.color} />
                    </View>
                    <View style={styles.hubCardText}>
                      <Text style={styles.hubTitleFlat}>{hub.title}</Text>
                      <Text style={styles.hubSubtitleFlat}>{hub.subtitle}</Text>
                    </View>
                  </View>

                  {/* Right: Progress and Status Badge */}
                  <View style={styles.hubCardRight}>
                    <View style={styles.hubProgressSection}>
                      <Text style={styles.hubProgressLabelFlat}>{pct}% selesai</Text>
                      <View style={styles.hubProgressBarFlat}>
                        <View style={[styles.hubProgressFill, { width: `${pct}%` as any, backgroundColor: hub.color }]} />
                      </View>
                    </View>

                    <View style={[styles.hubBadgeFlat, { backgroundColor: hub.bgColor, borderColor: hub.borderColor }]}>
                      <Text style={[styles.hubBadgeText, { color: hub.color }]}>{active} aktif</Text>
                    </View>
                  </View>
                </View>
              </AnimatedButton>
            );
          })}
        </View>

        {/* Checklists (Daftar Saya) */}
        {checklists.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Checklist</Text>
            <View style={styles.hubGrid}>
              {checklists.map((hub) => {
                const active = tasks.filter((t) => t.category === hub.id && !t.isCompleted).length;
                const total = tasks.filter((t) => t.category === hub.id).length;
                const done = tasks.filter((t) => t.category === hub.id && t.isCompleted).length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                return (
                  <AnimatedButton
                    key={hub.id}
                    style={[styles.hubCard, { borderColor: hub.borderColor }]}
                    onPress={() => onSelectHub(hub)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[hub.bgColor, 'transparent']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />

                    <View style={styles.hubCardRow}>
                      {/* Left: Icon and Title/Subtitle */}
                      <View style={styles.hubCardLeft}>
                        <View style={[styles.hubIconBox, { backgroundColor: hub.glowColor }]}>
                          <Feather name={hub.iconName as any} size={18} color={hub.color} />
                        </View>
                        <View style={styles.hubCardText}>
                          <Text style={styles.hubTitleFlat}>{hub.title}</Text>
                          <Text style={styles.hubSubtitleFlat}>{hub.subtitle}</Text>
                        </View>
                      </View>

                      {/* Right: Progress and Status Badge */}
                      <View style={styles.hubCardRight}>
                        <View style={styles.hubProgressSection}>
                          <Text style={styles.hubProgressLabelFlat}>{pct}% selesai</Text>
                          <View style={styles.hubProgressBarFlat}>
                            <View style={[styles.hubProgressFill, { width: `${pct}%` as any, backgroundColor: hub.color }]} />
                          </View>
                        </View>

                        <View style={[styles.hubBadgeFlat, { backgroundColor: hub.bgColor, borderColor: hub.borderColor }]}>
                          <Text style={[styles.hubBadgeText, { color: hub.color }]}>{active} aktif</Text>
                        </View>
                      </View>
                    </View>
                  </AnimatedButton>
                );
              })}
            </View>
          </>
        )}

        {/* Smart Task List */}
        <View style={styles.listHeaderRow}>
          <View style={styles.titleCapsule}>
            <Feather name="list" size={16} color={COLORS.white} />
            <Text style={styles.titleCapsuleText}>Daftar Tugas</Text>
          </View>
          {renderSearchBar()}
        </View>
        {renderTabsAndTasks()}

        <CreateHubModal
          isOpen={isHubModalOpen}
          onClose={() => setIsHubModalOpen(false)}
          onSave={onCreateHub}
        />
      </ScrollView>
    );
  }

  // --- MOBILE LAYOUT ---
  return (
    <View style={styles.container}>
      <View style={styles.mobileHeader}>
        <View>
          <Text style={styles.mobileName}>Halo {profile?.name || 'Hustler'} 👋</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          {renderBellButton()}
          <AnimatedButton style={styles.mobileAddListBtn} onPress={() => setIsHubModalOpen(true)} activeOpacity={0.8}>
            <Feather name="folder-plus" size={20} color={COLORS.amber} />
          </AnimatedButton>
          <AnimatedButton style={styles.mobileAddButton} onPress={onAddTask} activeOpacity={0.8}>
            <Feather name="plus" size={20} color={COLORS.bg} />
          </AnimatedButton>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.mobileContentInner} showsVerticalScrollIndicator={false}>
        {/* Stats — Split Workspace vs Checklist */}
        {/* Workspace Stats */}
        <View style={[styles.splitStatCard, { borderColor: COLORS.blueBorder }]}>
          <LinearGradient
            colors={['rgba(59,130,246,0.08)', 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.splitStatHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.splitStatIcon, { backgroundColor: COLORS.blueLight }]}>
                <Feather name="layers" size={12} color={COLORS.blue} />
              </View>
              <Text style={[styles.splitStatTitle, { color: COLORS.blue }]}>Workspaces</Text>
            </View>
            <Text style={[styles.splitStatPct, { color: COLORS.blue }]}>{wsPct}%</Text>
          </View>
          <View style={[styles.progressBarBg, { marginVertical: 6 }]}>
            <View style={[styles.progressBarFill, { width: `${wsPct}%` as any, backgroundColor: COLORS.blue }]} />
          </View>
          <View style={styles.splitStatRow}>
            <Text style={styles.splitStatSub}><Text style={{ color: COLORS.blue, fontWeight: '700' }}>{wsStats.pending}</Text> pending</Text>
            <Text style={styles.splitStatSub}><Text style={{ color: COLORS.green, fontWeight: '700' }}>{wsStats.completed}</Text> selesai</Text>
            <Text style={styles.splitStatSub}><Text style={{ color: COLORS.textMuted, fontWeight: '700' }}>{wsStats.total}</Text> total</Text>
          </View>
        </View>

        {/* Checklist Stats */}
        {checklists.length > 0 && (
          <View style={[styles.splitStatCard, { borderColor: COLORS.greenBorder }]}>
            <LinearGradient
              colors={['rgba(34,197,94,0.08)', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.splitStatHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.splitStatIcon, { backgroundColor: COLORS.greenLight }]}>
                  <Feather name="check-square" size={12} color={COLORS.green} />
                </View>
                <Text style={[styles.splitStatTitle, { color: COLORS.green }]}>Checklist</Text>
              </View>
              <Text style={[styles.splitStatPct, { color: COLORS.green }]}>{clPct}%</Text>
            </View>
            <View style={[styles.progressBarBg, { marginVertical: 6 }]}>
              <View style={[styles.progressBarFill, { width: `${clPct}%` as any, backgroundColor: COLORS.green }]} />
            </View>
            <View style={styles.splitStatRow}>
              <Text style={styles.splitStatSub}><Text style={{ color: COLORS.amber, fontWeight: '700' }}>{clStats.pending}</Text> tersisa</Text>
              <Text style={styles.splitStatSub}><Text style={{ color: COLORS.green, fontWeight: '700' }}>{clStats.completed}</Text> selesai</Text>
              <Text style={styles.splitStatSub}><Text style={{ color: COLORS.textMuted, fontWeight: '700' }}>{clStats.total}</Text> total</Text>
            </View>
          </View>
        )}

        {/* Workspaces (Mobile) */}
        <Text style={styles.mobileSectionTitle}>Workspaces</Text>
        {workspaces.map((hub) => {
          const activeTasks = tasks.filter((t) => t.category === hub.id && !t.isCompleted).length;
          return (
            <AnimatedButton
              key={hub.id}
              style={[styles.mobileHubCard, { backgroundColor: hub.bgColor, borderColor: hub.borderColor }]}
              onPress={() => onSelectHub(hub)}
              activeOpacity={0.7}
            >
              <View style={styles.mobileHubLeft}>
                <View style={[styles.hubIconBox, { backgroundColor: hub.glowColor }]}>
                  <Feather name={hub.iconName as any} size={18} color={hub.color} />
                </View>
                <View>
                  <Text style={styles.hubTitleMobile}>{hub.title}</Text>
                  <Text style={styles.mobileHubSubtitle}>{hub.subtitle}</Text>
                </View>
              </View>
              <View style={styles.mobileHubRight}>
                <Text style={[styles.mobileHubCount, { color: hub.color }]}>{activeTasks}</Text>
                <Text style={styles.mobileHubCountLabel}>aktif</Text>
              </View>
            </AnimatedButton>
          );
        })}

        {/* Checklists / Daftar Saya (Mobile) */}
        {checklists.length > 0 && (
          <>
            <Text style={[styles.mobileSectionTitle, { marginTop: 12 }]}>Checklist</Text>
            {checklists.map((hub) => {
              const activeTasks = tasks.filter((t) => t.category === hub.id && !t.isCompleted).length;
              return (
                <AnimatedButton
                  key={hub.id}
                  style={[styles.mobileHubCard, { backgroundColor: hub.bgColor, borderColor: hub.borderColor }]}
                  onPress={() => onSelectHub(hub)}
                  activeOpacity={0.7}
                >
                  <View style={styles.mobileHubLeft}>
                    <View style={[styles.hubIconBox, { backgroundColor: hub.glowColor }]}>
                      <Feather name={hub.iconName as any} size={18} color={hub.color} />
                    </View>
                    <View>
                      <Text style={styles.hubTitleMobile}>{hub.title}</Text>
                      <Text style={styles.mobileHubSubtitle}>{hub.subtitle}</Text>
                    </View>
                  </View>
                  <View style={styles.mobileHubRight}>
                    <Text style={[styles.mobileHubCount, { color: hub.color }]}>{activeTasks}</Text>
                    <Text style={styles.mobileHubCountLabel}>aktif</Text>
                  </View>
                </AnimatedButton>
              );
            })}
          </>
        )}

        {/* Smart Task List (mobile) */}
        <View style={[styles.listHeaderRow, { marginTop: 12, paddingHorizontal: 4 }]}>
          <View style={styles.titleCapsule}>
            <Feather name="list" size={14} color={COLORS.white} />
            <Text style={styles.titleCapsuleText}>Daftar Tugas</Text>
          </View>
          {renderSearchBar()}
        </View>
        {renderTabsAndTasks()}

        <CreateHubModal
          isOpen={isHubModalOpen}
          onClose={() => setIsHubModalOpen(false)}
          onSave={onCreateHub}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // --- DESKTOP ---
  desktopContent: { padding: 24, paddingLeft: 28, paddingBottom: 48 },
  desktopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 999,
    elevation: 99,
  },
  greeting: { color: COLORS.textDim, fontSize: 12, fontWeight: '500', marginBottom: 2 },
  userName: { color: COLORS.white, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  addButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.amber, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  addButtonText: { color: COLORS.bg, fontWeight: '700', fontSize: 13 },

  addListButtonDesktop: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, backgroundColor: COLORS.bgInput,
    borderWidth: 1, borderColor: COLORS.amberBorder,
  },
  addListButtonText: { color: COLORS.amber, fontSize: 12, fontWeight: '600' },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 999,
    elevation: 99,
  },
  // Bell
  bellWrapper: {
    position: 'relative',
    zIndex: 999,
    elevation: 99,
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.bgSurface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: COLORS.red,
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.bg,
  },
  bellBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },
  bellDropdown: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 270,
    backgroundColor: '#0d1526',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    zIndex: 999,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 12px 40px rgba(0,0,0,0.6)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 20 },
    }),
  } as any,
  bellDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bellDropdownTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  bellEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  bellEmptyText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  bellList: {
    maxHeight: 240,
  },
  bellItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    borderLeftWidth: 3,
  },
  bellItemIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellItemText: {
    flex: 1,
  },
  bellItemTitle: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  bellItemSub: {
    fontSize: 10,
    marginTop: 1,
  },

  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10 },
  titleCapsule: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.borderLight, gap: 6
  },
  titleCapsuleText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgInput,
    borderRadius: 100, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.borderLight, flex: 1, maxWidth: 260, gap: 6
  },
  searchInput: { flex: 1, color: COLORS.white, fontSize: 12 },

  bentoRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  bentoCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    overflow: 'hidden',
  },
  bentoLarge: { flex: 2, justifyContent: 'space-between', minHeight: 120 },
  bentoSmallGroup: { flex: 1, gap: 10 },
  bentoSmall: { flex: 1, justifyContent: 'center' },
  bentoCardLabel: {
    color: COLORS.textDim, fontSize: 9, fontWeight: '700',
    letterSpacing: 1.2, marginBottom: 8,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  bigNumber: { color: COLORS.white, fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  progressSubtext: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  progressBarBg: { height: 4, backgroundColor: COLORS.border, borderRadius: 2 },
  progressBarFill: { height: 4, backgroundColor: COLORS.amber, borderRadius: 2 },

  statNumberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  statIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statNumber: { color: COLORS.white, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  statLabelBottom: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },

  sectionTitle: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: 2 },

  hubGrid: { flexDirection: 'column', gap: 8, marginBottom: 20 },
  hubCard: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.bgCard,
  },
  hubCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  hubIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  hubBadge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },

  // Premium Horizontal Alignment Styles
  hubCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  hubCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  hubCardText: {
    justifyContent: 'center',
    flex: 1,
  },
  hubTitleFlat: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  hubSubtitleFlat: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  hubCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  hubProgressSection: {
    alignItems: 'flex-end',
    width: 110,
  },
  hubProgressLabelFlat: {
    color: COLORS.textDim,
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '500',
  },
  hubProgressBarFlat: {
    width: '100%',
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  hubBadgeFlat: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  // Mobile neat fixes
  hubTitleMobile: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  mobileHubSubtitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 1,
  },

  hubBadgeText: { fontSize: 10, fontWeight: '700' },
  hubTitle: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 3 },
  hubSubtitle: { color: COLORS.textMuted, fontSize: 11, marginBottom: 10 },
  hubProgressBar: { height: 3, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: 4 },
  hubProgressFill: { height: 3, borderRadius: 2 },
  hubProgressLabel: { color: COLORS.textDim, fontSize: 10 },

  urgentList: { gap: 6 },
  urgentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  urgentTitle: { color: COLORS.white, fontSize: 13, fontWeight: '500', marginBottom: 3 },
  urgentMeta: { color: COLORS.textDim, fontSize: 11 },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },

  // --- MOBILE ---
  mobileHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 48, paddingBottom: 14, paddingHorizontal: 18,
    backgroundColor: COLORS.bgCard,
    borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  mobileGreeting: { color: COLORS.textDim, fontSize: 11, marginBottom: 1 },
  mobileName: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  mobileAddButton: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.amber,
    alignItems: 'center', justifyContent: 'center',
  },
  mobileAddListBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.amberBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { flex: 1 },
  mobileContentInner: { padding: 12, paddingBottom: 100, gap: 8 },
  mobileSectionTitle: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 8, paddingHorizontal: 4 },

  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 2 },
  statPill: {
    flex: 1, backgroundColor: COLORS.bgCard, borderWidth: 1,
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center',
  },
  statPillNum: { fontSize: 18, fontWeight: '800' },
  statPillLabel: { color: COLORS.textDim, fontSize: 9, marginTop: 2, fontWeight: '500' },

  splitStatCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 2,
    overflow: 'hidden',
  },
  splitStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitStatIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitStatTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  splitStatPct: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  splitStatRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  splitStatSub: {
    color: COLORS.textDim,
    fontSize: 10,
  },

  mobileHubCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  mobileHubLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  mobileHubRight: { alignItems: 'flex-end', flexShrink: 0 },
  mobileHubCount: { fontSize: 18, fontWeight: '800' },
  mobileHubCountLabel: { color: COLORS.textDim, fontSize: 9, marginTop: 1 },

  completedText: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  tasksSection: { marginBottom: 16 },
  tabsScroll: { flexDirection: 'row', gap: 6, paddingBottom: 10, paddingHorizontal: 2 },
  tabButton: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 100, backgroundColor: COLORS.bgInput,
    borderWidth: 1, borderColor: 'transparent'
  },
  tabText: { color: COLORS.textDim, fontSize: 11, fontWeight: '500' },
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 28, backgroundColor: COLORS.bgCard,
    borderRadius: 12, marginTop: 8,
    borderWidth: 1, borderColor: COLORS.borderLight, borderStyle: 'dashed'
  },
  emptyText: { color: COLORS.textMuted, fontSize: 12, marginTop: 8 },
  taskCheckbox: {
    padding: 6,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskActionBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginLeft: 4,
  },
});
