import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { icons } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
  '#FF5722', '#795548', '#9E9E9E', '#607D8B'
];

export function generateColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function getRandomIcon() {
  const iconKeys = Object.keys(icons);
  const randomKey = iconKeys[Math.floor(Math.random() * iconKeys.length)];
  return randomKey;
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${(minutes / 60).toFixed(1)}h`;
  if (minutes < 10080) return `${(minutes / 1440).toFixed(1)}d`;
  if (minutes < 43200) return `${(minutes / 10080).toFixed(1)}w`;
  if (minutes < 525600) return `${(minutes / 43200).toFixed(1)}mo`;
  return `${(minutes / 525600).toFixed(1)}y`;
};

export const timeToMinutes = (time: number, unit: string) => {
  switch (unit) {
    case 'hours':
      return time * 60;
    case 'days':
      return time * 60 * 24;
    case 'weeks':
      return time * 60 * 24 * 7;
    case 'months':
      return time * 60 * 24 * 30; // Approximation
    case 'years':
        return time * 60 * 24 * 365; // Approximation
    default:
      return time;
  }
};
