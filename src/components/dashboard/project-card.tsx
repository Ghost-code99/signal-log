'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ExternalLink, MoreHorizontal, Clock, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/app/dashboard/actions';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const STATUS_CONFIG = {
  Active: {
    color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
    label: 'Active',
    description: 'In progress'
  },
  Stalled: {
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    icon: AlertCircle,
    label: 'Stalled',
    description: 'Needs attention'
  },
  Validated: {
    color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
    icon: CheckCircle2,
    label: 'Validated',
    description: 'Proven concept'
  },
  Idea: {
    color: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
    icon: Lightbulb,
    label: 'Idea',
    description: 'Early stage'
  },
};

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const lastUpdated = new Date(project.updatedAt);
  const now = new Date();
  const daysSinceUpdate = Math.floor(
    (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
  );

  const statusConfig = STATUS_CONFIG[project.status];
  const StatusIcon = statusConfig.icon;

  const getTimeDisplay = () => {
    if (daysSinceUpdate === 0) return 'Updated today';
    if (daysSinceUpdate === 1) return 'Updated yesterday';
    if (daysSinceUpdate < 7) return `Updated ${daysSinceUpdate} days ago`;
    if (daysSinceUpdate < 30)
      return `Updated ${Math.floor(daysSinceUpdate / 7)} weeks ago`;
    return `Updated ${Math.floor(daysSinceUpdate / 30)} months ago`;
  };

  const getUrgencyLevel = () => {
    if (project.status === 'Stalled' && daysSinceUpdate > 7) return 'high';
    if (project.status === 'Active' && daysSinceUpdate > 14) return 'medium';
    if (daysSinceUpdate > 30) return 'high';
    return 'low';
  };

  const urgencyLevel = getUrgencyLevel();

  return (
    <Card className={cn(
      "group relative overflow-hidden border transition-all duration-200 hover:shadow-md hover:border-primary/20",
      urgencyLevel === 'high' && "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20",
      urgencyLevel === 'medium' && "border-orange-200 bg-orange-50/30 dark:border-orange-800 dark:bg-orange-950/10"
    )}>
      <div className="p-6">
        {/* Header with Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <Link href={`/dashboard/${project.id}`} className="block">
              <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight">
                {project.name}
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              {statusConfig.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium",
                statusConfig.color
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tags.slice(0, 3).map(tag => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-muted/50">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{getTimeDisplay()}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(project)}
              className="h-7 w-7 p-0 hover:bg-muted"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(project)}
              className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Link href={`/dashboard/${project.id}`}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-muted">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* AI Health Indicator */}
      {urgencyLevel === 'high' && (
        <div className="absolute top-3 right-3">
          <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
        </div>
      )}
    </Card>
  );
}
