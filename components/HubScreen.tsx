// components/HubScreen.tsx
// Upgraded Hub Screen with split panel (desktop) and full-screen list (mobile)

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, Hub, Task, getDeadlineStatus, PRIORITY_COLORS, PRIORITY_LABELS, Priority } from '@/lib/constants';

interface HubScreenProps {
  hub: Hub;
  tasks: Task[];
  onBack: () => void;
  onToggleTask: (taskId: string, currentStatus: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onOpenTaskModal: () => void;
  onDeleteHub?: (hubId: string) => void;
}

function TaskCard({
  task,
  hub,
  onToggle,
  onDelete,
  onEdit,
  isSelected,
  onSelect,
}: {
  task: Task;
  hub: Hub;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  const deadlineInfo = getDeadlineStatus(task.deadline, task.isCompleted);
  const priority = task.priority as Priority;

  return (
    <TouchableOpacity
      style={[
        styles.taskCard,
        task.isCompleted && styles.taskCardCompleted,
        isSelected && { borderColor: hub.color, backgroundColor: hub.bgColor },
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={[styles.priorityStripe, { backgroundColor: PRIORITY_COLORS[priority] || COLORS.textDim }]} />

      <TouchableOpacity style={styles.checkButton} onPress={onToggle} activeOpacity={0.7}>
        <View style={[
          styles.checkCircle,
          task.isCompleted && { backgroundColor: COLORS.green, borderColor: COLORS.green },
        ]}>
          {task.isCompleted && <Feather name="check" size={12} color={COLORS.white} />}
        </View>
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <Text
          style={[styles.taskTitle, task.isCompleted && styles.taskTitleCompleted]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        {task.notes ? (
          <Text style={styles.taskNotes} numberOfLines={1}>{task.notes}</Text>
        ) : null}
        <View style={styles.taskMeta}>
          <View style={[styles.deadlinePill, { borderColor: `${deadlineInfo.color}40` }]}>
            <Feather name="calendar" size={10} color={deadlineInfo.color} />
            <Text style={[styles.taskDeadline, { color: deadlineInfo.color }]}>
              {deadlineInfo.text}
            </Text>
          </View>
          {priority && (
            <View style={[styles.priorityPill, { borderColor: `${PRIORITY_COLORS[priority]}40` }]}>
              <Text style={[styles.priorityText, { color: PRIORITY_COLORS[priority] }]}>
                {PRIORITY_LABELS[priority]}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.taskActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit} activeOpacity={0.7}>
          <Feather name="edit-3" size={14} color={COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete} activeOpacity={0.7}>
          <Feather name="trash-2" size={14} color={COLORS.red} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function TaskDetail({ task, hub }: { task: Task; hub: Hub }) {
  const deadlineInfo = getDeadlineStatus(task.deadline, task.isCompleted);
  const priority = task.priority as Priority;

  return (
    <View style={styles.detailPanel}>
      <LinearGradient
        colors={[hub.bgColor, 'transparent']}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={styles.detailGradient}
      />
      <Text style={styles.detailLabel}>DETAIL TUGAS</Text>
      <Text style={styles.detailTitle}>{task.title}</Text>

      {task.notes && (
        <View style={styles.detailSection}>
          <Text style={styles.detailSectionLabel}>Catatan</Text>
          <Text style={styles.detailNotes}>{task.notes}</Text>
        </View>
      )}

      <View style={styles.detailMetaGrid}>
        <View style={styles.detailMetaItem}>
          <Feather name="calendar" size={14} color={COLORS.textDim} />
          <View>
            <Text style={styles.detailMetaLabel}>Tenggat</Text>
            <Text style={[styles.detailMetaValue, { color: deadlineInfo.color }]}>
              {new Date(task.deadline).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':')} WIB
            </Text>
          </View>
        </View>
        <View style={styles.detailMetaItem}>
          <Feather name="flag" size={14} color={COLORS.textDim} />
          <View>
            <Text style={styles.detailMetaLabel}>Prioritas</Text>
            <Text style={[styles.detailMetaValue, { color: PRIORITY_COLORS[priority] || COLORS.textMuted }]}>
              {PRIORITY_LABELS[priority] || '-'}
            </Text>
          </View>
        </View>
        <View style={styles.detailMetaItem}>
          <Feather name="tag" size={14} color={COLORS.textDim} />
          <View>
            <Text style={styles.detailMetaLabel}>Status</Text>
            <Text style={[styles.detailMetaValue, { color: task.isCompleted ? COLORS.green : COLORS.amber }]}>
              {task.isCompleted ? 'Selesai' : 'Aktif'}
            </Text>
          </View>
        </View>
        <View style={styles.detailMetaItem}>
          <Feather name="grid" size={14} color={COLORS.textDim} />
          <View>
            <Text style={styles.detailMetaLabel}>Hub</Text>
            <Text style={[styles.detailMetaValue, { color: hub.color }]}>{hub.title}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.detailTimestamp}>
        Dibuat: {new Date(task.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':')} WIB
      </Text>
    </View>
  );
}

export default function HubScreen({
  hub, tasks, onBack, onToggleTask, onDeleteTask, onEditTask, onOpenTaskModal, onDeleteHub,
}: HubScreenProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 1024;
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const isCustomHub = hub.id.startsWith('hub_');

  const filteredTasks = tasks.filter((t) => t.category === hub.id);
  const pendingTasks = filteredTasks.filter((t) => !t.isCompleted);
  const completedTasks = filteredTasks.filter((t) => t.isCompleted);

  const renderTaskList = () => (
    <>
      {filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: hub.bgColor }]}>
            <Feather name={hub.iconName as any} size={36} color={hub.color} />
          </View>
          <Text style={styles.emptyTitle}>Belum Ada Tugas</Text>
          <Text style={styles.emptyText}>Ketuk tombol (+) untuk mulai menambah tugas di {hub.title}.</Text>
        </View>
      ) : (
        <>
          {pendingTasks.length > 0 && (
            <>
              <Text style={styles.listSectionLabel}>AKTIF ({pendingTasks.length})</Text>
              {pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  hub={hub}
                  onToggle={() => onToggleTask(task.id, task.isCompleted)}
                  onDelete={() => onDeleteTask(task.id)}
                  onEdit={() => onEditTask(task)}
                  isSelected={isDesktop && selectedTask?.id === task.id}
                  onSelect={isDesktop ? () => setSelectedTask(task) : undefined}
                />
              ))}
            </>
          )}
          {completedTasks.length > 0 && (
            <>
              <Text style={[styles.listSectionLabel, { marginTop: 16 }]}>SELESAI ({completedTasks.length})</Text>
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  hub={hub}
                  onToggle={() => onToggleTask(task.id, task.isCompleted)}
                  onDelete={() => onDeleteTask(task.id)}
                  onEdit={() => onEditTask(task)}
                  isSelected={isDesktop && selectedTask?.id === task.id}
                  onSelect={isDesktop ? () => setSelectedTask(task) : undefined}
                />
              ))}
            </>
          )}
        </>
      )}
    </>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        {/* Left: Task List */}
        <View style={styles.desktopLeft}>
          {/* Hub Header */}
          <View style={[styles.desktopHubHeader, { borderBottomColor: hub.borderColor }]}>
            <View style={[styles.desktopHubIcon, { backgroundColor: hub.glowColor }]}>
              <Feather name={hub.iconName as any} size={24} color={hub.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.desktopHubTitle}>{hub.title}</Text>
              <Text style={styles.desktopHubSubtitle}>{filteredTasks.length} tugas · {pendingTasks.length} aktif</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {isCustomHub && onDeleteHub && (
                <TouchableOpacity style={[styles.desktopAddBtn, { backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.redBorder }]} onPress={() => onDeleteHub(hub.id)} activeOpacity={0.8}>
                  <Feather name="trash-2" size={16} color={COLORS.red} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.desktopAddBtn, { backgroundColor: hub.accentColor }]} onPress={onOpenTaskModal} activeOpacity={0.8}>
                <Feather name="plus" size={16} color={COLORS.white} />
                <Text style={styles.desktopAddBtnText}>Tambah</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.desktopTaskList} contentContainerStyle={styles.desktopTaskListInner} showsVerticalScrollIndicator={false}>
            {renderTaskList()}
          </ScrollView>
        </View>

        {/* Right: Detail Panel */}
        <View style={styles.desktopRight}>
          {selectedTask ? (
            <TaskDetail task={selectedTask} hub={hub} />
          ) : (
            <View style={styles.emptyDetail}>
              <Feather name="mouse-pointer" size={32} color={COLORS.textDim} style={{ opacity: 0.4 }} />
              <Text style={styles.emptyDetailText}>Pilih tugas untuk melihat detail</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // --- MOBILE ---
  return (
    <View style={styles.container}>
      <LinearGradient colors={[hub.bgColor, COLORS.bg]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.mobileHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Feather name="chevron-left" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.mobileHeaderContent}>
          <View style={[styles.mobileHubIcon, { backgroundColor: hub.glowColor }]}>
            <Feather name={hub.iconName as any} size={28} color={hub.color} />
          </View>
          <View>
            <Text style={styles.mobileHubTitle}>{hub.title}</Text>
            <Text style={styles.mobileHubSub}>{hub.subtitle}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {isCustomHub && onDeleteHub && (
            <TouchableOpacity onPress={() => onDeleteHub(hub.id)} activeOpacity={0.8}>
              <Feather name="trash-2" size={20} color={COLORS.red} />
            </TouchableOpacity>
          )}
          <View style={styles.mobileStats}>
            <Text style={[styles.mobileStatNum, { color: hub.color }]}>{pendingTasks.length}</Text>
            <Text style={styles.mobileStatLabel}>aktif</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.mobileContentInner} showsVerticalScrollIndicator={false}>
        {renderTaskList()}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: hub.accentColor }]}
        onPress={onOpenTaskModal}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Desktop
  desktopContainer: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.bg },
  desktopLeft: { width: 400, borderRightWidth: 1, borderRightColor: COLORS.border },
  desktopRight: { flex: 1 },
  desktopHubHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 24, borderBottomWidth: 1,
  },
  desktopHubIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  desktopHubTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  desktopHubSubtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  desktopAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  desktopAddBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
  desktopTaskList: { flex: 1 },
  desktopTaskListInner: { padding: 16, gap: 8, paddingBottom: 40 },

  detailPanel: { flex: 1, padding: 32, overflow: 'hidden' },
  detailGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  detailLabel: { color: COLORS.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 16 },
  detailTitle: { color: COLORS.white, fontSize: 26, fontWeight: '800', lineHeight: 34, marginBottom: 24, letterSpacing: -0.5 },
  detailSection: { marginBottom: 24 },
  detailSectionLabel: { color: COLORS.textDim, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  detailNotes: { color: COLORS.textMuted, fontSize: 14, lineHeight: 22, backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  detailMetaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  detailMetaItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', width: '45%' },
  detailMetaLabel: { color: COLORS.textDim, fontSize: 11, marginBottom: 2 },
  detailMetaValue: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  detailTimestamp: { color: COLORS.textDim, fontSize: 11 },

  emptyDetail: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyDetailText: { color: COLORS.textDim, fontSize: 14, marginTop: 12 },

  // Mobile
  mobileHeader: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.7)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  mobileHeaderContent: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
  mobileHubIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  mobileHubTitle: { color: COLORS.white, fontSize: 22, fontWeight: '800' },
  mobileHubSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  mobileStats: { alignItems: 'flex-end', marginTop: 4 },
  mobileStatNum: { fontSize: 28, fontWeight: '800' },
  mobileStatLabel: { color: COLORS.textDim, fontSize: 12 },

  content: { flex: 1 },
  mobileContentInner: { padding: 16, paddingBottom: 180, gap: 10 },

  // Task Card (shared)
  taskCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden', gap: 0,
  },
  taskCardCompleted: { opacity: 0.55 },
  priorityStripe: { width: 3, alignSelf: 'stretch' },
  checkButton: { padding: 14, paddingRight: 0 },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  taskContent: { flex: 1, padding: 14, paddingLeft: 12 },
  taskTitle: { color: COLORS.white, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  taskTitleCompleted: { color: COLORS.textDim, textDecorationLine: 'line-through' },
  taskNotes: { color: COLORS.textDim, fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  deadlinePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
  },
  taskDeadline: { fontSize: 11, fontWeight: '500' },
  priorityPill: {
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
  },
  priorityText: { fontSize: 10, fontWeight: '700' },
  taskActions: { flexDirection: 'column', justifyContent: 'center', padding: 10, gap: 4 },
  actionButton: { padding: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)' },

  // List section
  listSectionLabel: {
    color: COLORS.textDim, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, marginBottom: 8, marginLeft: 2,
  },

  // Empty
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 240 },

  // FAB
  fab: {
    position: 'absolute', bottom: 90, right: 20,
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
});
