'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/app/dashboard/actions';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const STATUS_COLORS = {
  Active:
    'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  Stalled:
    'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  Validated:
    'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  Idea: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
};

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const lastUpdated = new Date(project.updatedAt);
  const now = new Date();
  const daysSinceUpdate = Math.floor(
    (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
  );

  const getTimeDisplay = () => {
    if (daysSinceUpdate === 0) return 'Updated today';
    if (daysSinceUpdate === 1) return 'Updated yesterday';
    if (daysSinceUpdate < 7) return `Updated ${daysSinceUpdate} days ago`;
    if (daysSinceUpdate < 30)
      return `Updated ${Math.floor(daysSinceUpdate / 7)} weeks ago`;
    return `Updated ${Math.floor(daysSinceUpdate / 30)} months ago`;
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all group">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/dashboard/${project.id}`} className="flex-1 min-w-0">
            <h3 className="text-xl font-bold hover:text-primary transition-colors line-clamp-2">
              {project.name}
            </h3>
          </Link>
          <Badge className={`shrink-0 ${STATUS_COLORS[project.status]}`}>
            {project.status}
          </Badge>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{getTimeDisplay()}</p>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(project)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(project)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Link href={`/dashboard/${project.id}`}>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
