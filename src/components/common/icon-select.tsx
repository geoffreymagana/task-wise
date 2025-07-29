'use client';

import { useRef, useState } from 'react';
import { icons } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Icon } from './icon';

interface IconSelectProps {
  value?: string;
  onChange: (value: string) => void;
  color?: string;
  onColorChange: (color: string) => void;
}

const iconKeys = Object.keys(icons);

export function IconSelect({ value, onChange, color, onColorChange }: IconSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const filteredIcons = iconKeys.filter(key =>
    key.toLowerCase().includes(search.toLowerCase())
  );

  const handleColorInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent the popover from closing when clicking the color input.
  };
  
  const handleSelectIcon = (icon: string) => {
    onChange(icon);
    setOpen(false); // Close popover after selection
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer relative"
            style={{ backgroundColor: color }}
            onClick={() => setOpen(true)}
          >
            <Icon name={value || 'Package'} className="w-6 h-6 text-white pointer-events-none" />
            <input
              ref={colorInputRef}
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              onClick={handleColorInputClick}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Change task color"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[200px]">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="m-2 w-[calc(100%-1rem)]"
          />
          <ScrollArea className="h-[200px]">
            <div className="grid grid-cols-4 gap-2 p-2">
              {filteredIcons.map(iconKey => (
                <Button
                  key={iconKey}
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSelectIcon(iconKey)}
                  className={value === iconKey ? 'bg-accent' : ''}
                >
                  <Icon name={iconKey} className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
