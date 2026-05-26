// lib/constants.ts
// Color palette & Hub definitions — Extended for cross-platform

export const COLORS = {
  bg: '#020617',          // slate-950
  bgCard: '#0f172a',      // slate-900
  bgSurface: '#1e293b',   // slate-800
  bgInput: '#020617',     // slate-950
  bgSidebar: '#080f1f',   // near-black with blue tint
  border: '#1e293b',      // slate-800
  borderLight: '#334155', // slate-700
  text: '#f8fafc',        // slate-50
  textMuted: '#94a3b8',   // slate-400
  textDim: '#64748b',     // slate-500
  amber: '#f59e0b',       // amber-500
  amberLight: 'rgba(245, 158, 11, 0.1)',
  amberBorder: 'rgba(245, 158, 11, 0.25)',
  amberGlow: 'rgba(245, 158, 11, 0.15)',
  blue: '#3b82f6',        // blue-500
  blueLight: 'rgba(59, 130, 246, 0.1)',
  blueBorder: 'rgba(59, 130, 246, 0.25)',
  blueGlow: 'rgba(59, 130, 246, 0.15)',
  purple: '#a855f7',      // purple-500
  purpleLight: 'rgba(168, 85, 247, 0.1)',
  purpleBorder: 'rgba(168, 85, 247, 0.25)',
  purpleGlow: 'rgba(168, 85, 247, 0.15)',
  green: '#22c55e',       // green-500
  greenLight: 'rgba(34, 197, 94, 0.1)',
  greenBorder: 'rgba(34, 197, 94, 0.25)',
  greenGlow: 'rgba(34, 197, 94, 0.15)',
  red: '#ef4444',         // red-500
  redLight: 'rgba(239, 68, 68, 0.1)',
  redBorder: 'rgba(239, 68, 68, 0.25)',
  redGlow: 'rgba(239, 68, 68, 0.15)',
  white: '#ffffff',
  black: '#000000',
};

export type Priority = 'low' | 'medium' | 'high';

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: COLORS.green,
  medium: COLORS.amber,
  high: COLORS.red,
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
};

export interface Hub {
  id: string;
  title: string;
  subtitle: string;
  iconName: string; // Feather icon name
  color: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
  glowColor: string;
}

export const HUBS: Hub[] = [
  {
    id: 'Kampus',
    title: 'Academy Hub',
    subtitle: 'Akademik & Riset',
    iconName: 'book-open',
    color: COLORS.blue,
    bgColor: COLORS.blueLight,
    borderColor: COLORS.blueBorder,
    accentColor: COLORS.blue,
    glowColor: COLORS.blueGlow,
  },
  {
    id: 'Event',
    title: 'Community Hub',
    subtitle: 'Organisasi & Komunitas',
    iconName: 'users',
    color: COLORS.purple,
    bgColor: COLORS.purpleLight,
    borderColor: COLORS.purpleBorder,
    accentColor: COLORS.purple,
    glowColor: COLORS.purpleGlow,
  },
  {
    id: 'Freelance',
    title: 'Creative Hub',
    subtitle: 'Freelance & Konten',
    iconName: 'briefcase',
    color: COLORS.amber,
    bgColor: COLORS.amberLight,
    borderColor: COLORS.amberBorder,
    accentColor: COLORS.amber,
    glowColor: COLORS.amberGlow,
  },
];

export interface Task {
  id: string;
  title: string;
  notes?: string;
  category: string;
  deadline: string;
  priority: Priority;
  isCompleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  createdAt: string;
  customHubs?: Hub[];
}

// --- HELPERS ---
export const getDeadlineStatus = (deadlineStr: string, isCompleted: boolean) => {
  if (isCompleted) return { color: COLORS.textDim, text: 'Selesai ✓' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { color: COLORS.red, text: `Terlewat ${Math.abs(diffDays)}h` };
  if (diffDays === 0) return { color: COLORS.amber, text: 'Hari Ini!' };
  if (diffDays <= 2) return { color: COLORS.amber, text: `${diffDays} Hari lagi` };
  return {
    color: COLORS.textMuted,
    text: new Date(deadlineStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    }),
  };
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 5) return 'Selamat Malam 🌙';
  if (hour < 12) return 'Selamat Pagi ☀️';
  if (hour < 15) return 'Selamat Siang 🌤️';
  if (hour < 19) return 'Selamat Sore 🌅';
  return 'Selamat Malam 🌙';
};

export const MOTIVATIONAL_QUOTES = [
  'Setiap langkah kecil membawamu lebih dekat ke tujuan besar.',
  'Hustle hari ini, panen hasil esok hari.',
  'Disiplin adalah jembatan antara impian dan prestasi.',
  'Mulai dari mana kamu berada. Gunakan apa yang kamu punya.',
  'Progres, bukan kesempurnaan, yang penting.',
];
