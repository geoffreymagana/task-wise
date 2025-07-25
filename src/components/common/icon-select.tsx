'use client';

import { useState } from 'react';
import { icons } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Icon } from './icon';

interface IconSelectProps {
  value?: string;
  onChange: (value: string) => void;
}

const iconKeys = Object.keys(icons);

export function IconSelect({ value, onChange }: IconSelectProps) {
  const [search, setSearch] = useState('');

  const filteredIcons = iconKeys.filter(key =>
    key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start">
          <Icon name={value || 'Package'} className="mr-2 h-4 w-4" />
          {value || 'Select Icon'}
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
                onClick={() => onChange(iconKey)}
                className={value === iconKey ? 'bg-accent' : ''}
              >
                <Icon name={iconKey} className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
