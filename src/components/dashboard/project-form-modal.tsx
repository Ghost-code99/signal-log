'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Project, validateProjectName } from '@/app/dashboard/actions';

type ProjectFormData = {
  name: string;
  description: string;
  status: Project['status'];
  tags: string[];
  id?: string;
};

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: ProjectFormData
  ) => Promise<{ success: boolean; error?: string }>;
  project?: Project | null;
  existingProjects: Project[];
}

const STATUS_OPTIONS: Project['status'][] = [
  'Active',
  'Stalled',
  'Validated',
  'Idea',
];
const COMMON_TAGS = [
  'MVP',
  'Growth',
  'Product',
  'Marketing',
  'Sales',
  'Fundraising',
  'Tech',
  'Research',
];

export function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  project,
  existingProjects,
}: ProjectFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('Active');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setStatus(project.status);
      setTags(project.tags);
    } else {
      resetForm();
    }
  }, [project, isOpen]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus('Active');
    setTags([]);
    setCustomTag('');
    setError('');
  };

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate name uniqueness
      const validation = await validateProjectName(
        name,
        existingProjects,
        project?.id
      );
      if (!validation.isValid) {
        setError(validation.error || 'Invalid project name');
        setIsSubmitting(false);
        return;
      }

      const data = project
        ? { id: project.id, name, description, status, tags }
        : { name, description, status, tags };

      const result = await onSubmit(data);

      if (result.success) {
        resetForm();
        onClose();
      } else {
        setError(result.error || 'Failed to save project');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const nameLength = name.length;
  const descriptionLength = description.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name">Project Name *</Label>
              <span
                className={`text-xs ${nameLength > 60 ? 'text-destructive' : 'text-muted-foreground'}`}
              >
                {nameLength}/60
              </span>
            </div>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Launch referral program"
              maxLength={60}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <span
                className={`text-xs ${descriptionLength > 300 ? 'text-destructive' : 'text-muted-foreground'}`}
              >
                {descriptionLength}/300
              </span>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of what this project aims to achieve..."
              maxLength={300}
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status *</Label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    status === option
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>

            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Common Tags */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.filter(t => !tags.includes(t)).map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleAddTag(tag)}
                  >
                    + {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <Input
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(customTag);
                  }
                }}
                placeholder="Add custom tag..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddTag(customTag)}
                disabled={!customTag.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {project ? 'Updating...' : 'Creating...'}
                </>
              ) : project ? (
                'Update Project'
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
