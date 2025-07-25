import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 40 + Math.floor(Math.random() * 30); // 40-70%
  const lightness = 50 + Math.floor(Math.random() * 10); // 50-60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
