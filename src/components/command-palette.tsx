'use client';

import { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  LayoutDashboard, 
  Lightbulb, 
  FlaskConical, 
  Brain,
  FolderOpen
} from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/app/dashboard/actions';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects?: Project[];
  onNewProject?: () => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'View all projects'
  },
  {
    name: 'Idea Capture',
    href: '/idea-capture',
    icon: Lightbulb,
    description: 'Capture and organize ideas'
  },
  {
    name: 'Assumption Challenger',
    href: '/assumption-challenger',
    icon: Brain,
    description: 'Challenge your assumptions'
  },
  {
    name: 'Experiment Canvas',
    href: '/experiment-canvas',
    icon: FlaskConical,
    description: 'Generate experiment plans'
  },
  {
    name: 'Project Health Scanner',
    href: '/project-health-scanner',
    icon: Brain,
    description: 'Analyze project portfolio'
  }
];

export function CommandPalette({ open, onOpenChange, projects = [], onNewProject }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredNavigation = navigationItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search projects, navigate, or run commands..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-12"
          />
          <CommandList className="max-h-96">
            <CommandEmpty>No results found.</CommandEmpty>
            
            {/* Quick Actions */}
            <CommandGroup heading="Quick Actions">
              <CommandItem onSelect={() => onNewProject?.()}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Create New Project</span>
                <Badge variant="outline" className="ml-auto">⌘N</Badge>
              </CommandItem>
            </CommandGroup>

            {/* Navigation */}
            {filteredNavigation.length > 0 && (
              <CommandGroup heading="Navigation">
                {filteredNavigation.map((item) => (
                  <CommandItem key={item.href} onSelect={() => onOpenChange(false)}>
                    <Link href={item.href} className="flex items-center w-full">
                      <item.icon className="mr-2 h-4 w-4" />
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Link>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Projects */}
            {filteredProjects.length > 0 && (
              <CommandGroup heading="Projects">
                {filteredProjects.map((project) => (
                  <CommandItem key={project.id} onSelect={() => onOpenChange(false)}>
                    <Link href={`/dashboard/${project.id}`} className="flex items-center w-full">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      <div className="flex-1">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {project.description || 'No description'}
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {project.status}
                      </Badge>
                    </Link>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
