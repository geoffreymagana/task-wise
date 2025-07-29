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

  const filteredIcons = iconKeys.filter(key =>
    key.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectIcon = (icon: string) => {
    onChange(icon);
    setOpen(false);
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Color Picker (independent of popover) */}
       <div className="relative w-10 h-10">
          <div 
            className="w-10 h-10 rounded-full border-2 border-muted"
            style={{ backgroundColor: color }}
            title="Change task color"
          ></div>
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Change task color"
          />
       </div>

      {/* Icon Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-12 h-12 flex items-center justify-center rounded-lg"
          >
            <Icon name={value || 'Package'} className="w-6 h-6" style={{ color }}/>
          </Button>
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
