// lib/constants.ts
// Color palette & Hub definitions

export const COLORS = {
  bg: '#020617',         // slate-950
  bgCard: '#0f172a',     // slate-900
  bgInput: '#020617',    // slate-950
  border: '#1e293b',     // slate-800
  borderLight: '#334155', // slate-700
  text: '#ffffff',
  textMuted: '#94a3b8',  // slate-400
  textDim: '#64748b',    // slate-500
  amber: '#f59e0b',      // amber-500
  amberLight: 'rgba(245, 158, 11, 0.1)',
  amberBorder: 'rgba(245, 158, 11, 0.2)',
  blue: '#3b82f6',       // blue-500
  blueLight: 'rgba(59, 130, 246, 0.1)',
  blueBorder: 'rgba(59, 130, 246, 0.2)',
  purple: '#a855f7',     // purple-500
  purpleLight: 'rgba(168, 85, 247, 0.1)',
  purpleBorder: 'rgba(168, 85, 247, 0.2)',
  green: '#22c55e',      // green-500
  red: '#ef4444',        // red-500
  redLight: 'rgba(239, 68, 68, 0.1)',
  redBorder: 'rgba(239, 68, 68, 0.2)',
  white: '#ffffff',
  black: '#000000',
};

export interface Hub {
  id: string;
  title: string;
  iconName: string; // Feather icon name
  color: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
}

export const HUBS: Hub[] = [
  {
    id: 'Kampus',
    title: 'Kampus & Akademik',
    iconName: 'book-open',
    color: COLORS.blue,
    bgColor: COLORS.blueLight,
    borderColor: COLORS.blueBorder,
    accentColor: COLORS.blue,
  },
  {
    id: 'Event',
    title: 'Event & Komunitas',
    iconName: 'users',
    color: COLORS.purple,
    bgColor: COLORS.purpleLight,
    borderColor: COLORS.purpleBorder,
    accentColor: COLORS.purple,
  },
  {
    id: 'Freelance',
    title: 'Kerja Sampingan',
    iconName: 'briefcase',
    color: COLORS.amber,
    bgColor: COLORS.amberLight,
    borderColor: COLORS.amberBorder,
    accentColor: COLORS.amber,
  },
];

export interface Task {
  id: string;
  title: string;
  category: string;
  deadline: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  createdAt: string;
}

// --- HELPERS ---
export const getDeadlineStatus = (deadlineStr: string, isCompleted: boolean) => {
  if (isCompleted) return { color: COLORS.textDim, text: 'Selesai' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { color: COLORS.red, text: 'Terlewat' };
  if (diffDays === 0) return { color: COLORS.amber, text: 'Hari Ini' };
  if (diffDays <= 2) return { color: COLORS.amber, text: `${diffDays} Hari lagi` };
  return {
    color: COLORS.textMuted,
    text: new Date(deadlineStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    }),
  };
};
