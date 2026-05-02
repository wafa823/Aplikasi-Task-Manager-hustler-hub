import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, Hub, Task, getDeadlineStatus } from '@/lib/constants';

interface HubScreenProps {
  hub: Hub;
  tasks: Task[];
  onBack: () => void;
  onToggleTask: (taskId: string, currentStatus: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onOpenTaskModal: () => void;
}

export default function HubScreen({
  hub,
  tasks,
  onBack,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onOpenTaskModal,
}: HubScreenProps) {
  const filteredTasks = tasks.filter((t) => t.category === hub.id);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: hub.bgColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Feather name="chevron-left" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Feather name={hub.iconName as any} size={28} color={hub.color} />
          <Text style={styles.headerText}>{hub.title}</Text>
        </View>
      </View>

      {/* Task List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name={hub.iconName as any} size={48} color={COLORS.textDim} style={{ opacity: 0.3 }} />
            <Text style={styles.emptyText}>
              Belum ada tugas di hub ini.{'\n'}Ketuk (+) untuk mulai menambah.
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => {
            const deadlineInfo = getDeadlineStatus(task.deadline, task.isCompleted);

            return (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  task.isCompleted && styles.taskCardCompleted,
                ]}
              >
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={() => onToggleTask(task.id, task.isCompleted)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={task.isCompleted ? 'check-circle' : 'circle'}
                    size={24}
                    color={task.isCompleted ? COLORS.green : COLORS.textDim}
                  />
                </TouchableOpacity>

                <View style={styles.taskContent}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.isCompleted && styles.taskTitleCompleted,
                    ]}
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                  <View style={styles.taskMeta}>
                    <Feather name="calendar" size={12} color={deadlineInfo.color} />
                    <Text style={[styles.taskDeadline, { color: deadlineInfo.color }]}>
                      {deadlineInfo.text}
                    </Text>
                  </View>
                </View>

                <View style={styles.taskActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onEditTask(task)}
                    activeOpacity={0.7}
                  >
                    <Feather name="edit-3" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onDeleteTask(task.id)}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={16} color={COLORS.red} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,42,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  headerText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 100,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: COLORS.textDim,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 12,
  },
  taskCardCompleted: {
    backgroundColor: 'rgba(15,23,42,0.5)',
    borderColor: COLORS.border,
  },
  checkButton: {
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '500',
  },
  taskTitleCompleted: {
    color: COLORS.textDim,
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  taskDeadline: {
    fontSize: 12,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 4,
    opacity: 0.6,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
