
'use client';

import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface FilterControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    priority: string[];
    status: string[];
    dueDate: Date | null;
  };
  setFilters: (filters: {
    priority: string[];
    status: string[];
    dueDate: Date | null;
  }) => void;
}

const priorityOptions = ['low', 'medium', 'high'];
const statusOptions = ['not_started', 'in_progress', 'completed'];

export default function FilterControls({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
}: FilterControlsProps) {

  const handlePriorityChange = (priority: string) => {
    setFilters({
      ...filters,
      priority: filters.priority.includes(priority)
        ? filters.priority.filter((p) => p !== priority)
        : [...filters.priority, priority],
    });
  };

  const handleStatusChange = (status: string) => {
    setFilters({
      ...filters,
      status: filters.status.includes(status)
        ? filters.status.filter((s) => s !== status)
        : [...filters.status, status],
    });
  };

  const handleDueDateChange = (date: Date | undefined) => {
    setFilters({ ...filters, dueDate: date || null });
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ priority: [], status: [], dueDate: null });
  }
  
  const hasActiveFilters = searchQuery || filters.priority.length > 0 || filters.status.length > 0 || filters.dueDate;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative flex-grow sm:flex-grow-0">
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 w-full sm:w-48"
        />
        <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">Priority</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {priorityOptions.map((priority) => (
            <DropdownMenuCheckboxItem
              key={priority}
              checked={filters.priority.includes(priority)}
              onCheckedChange={() => handlePriorityChange(priority)}
              onSelect={(e) => e.preventDefault()}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">Status</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statusOptions.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={filters.status.includes(status)}
              onCheckedChange={() => handleStatusChange(status)}
              onSelect={(e) => e.preventDefault()}
            >
              {status.replace('_', ' ')}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            size="sm"
            className={cn(
              'w-full sm:w-[200px] justify-start text-left font-normal',
              !filters.dueDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dueDate ? format(filters.dueDate, 'PPP') : <span>Due Date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={filters.dueDate ?? undefined}
            onSelect={handleDueDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}

    </div>
  );
}
