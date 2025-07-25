import { icons } from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = icons[name as keyof typeof icons];

  if (!LucideIcon) {
    return null; // Or return a default icon
  }

  return <LucideIcon {...props} />;
};
