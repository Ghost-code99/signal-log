'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X, Sparkles, Trash2, FolderOpen } from 'lucide-react';
import { logProjectActivity, ProjectActivity } from '@/app/dashboard/actions';
import { generateTagsSchema, validateInput, sanitizeText } from '../lib/validation';
import Link from 'next/link';

interface Idea {
  id: string;
  text: string;
  tags: string[];
  timestamp: number;
  projectId?: string;
  projectName?: string;
}

interface IdeaCaptureProps {
  projectId?: string;
  projectName?: string;
}

export function IdeaCapture({ projectId, projectName }: IdeaCaptureProps = {}) {
  const [ideaText, setIdeaText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [savedIdeas, setSavedIdeas] = useState<Idea[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // Load ideas from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('captured-ideas');
    if (stored) {
      try {
        setSavedIdeas(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load ideas:', e);
      }
    }
  }, []);

  // Save ideas to localStorage whenever they change
  useEffect(() => {
    if (savedIdeas.length > 0) {
      localStorage.setItem('captured-ideas', JSON.stringify(savedIdeas));
    }
  }, [savedIdeas]);

  const generateTags = async () => {
    if (!ideaText.trim()) return;

    // Client-side validation
    const validation = validateInput(generateTagsSchema, { idea: ideaText });
    if (!validation.success) {
      alert(validation.error);
      return;
    }

    setIsGenerating(true);
    setShowTagSuggestions(true);

    try {
      const response = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: ideaText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate tags');
      }

      const data = await response.json();
      setSuggestedTags(data.tags || []);
      setSelectedTags(data.tags || []);
    } catch (error) {
      console.error('Error generating tags:', error);
      const fallback = ['Product', 'Strategy'];
      setSuggestedTags(fallback);
      setSelectedTags(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      setCustomTag('');
    }
  };

  const saveIdea = async () => {
    if (!ideaText.trim()) return;

    const newIdea: Idea = {
      id: Date.now().toString(),
      text: sanitizeText(ideaText),
      tags: selectedTags.map(tag => sanitizeText(tag)),
      timestamp: Date.now(),
      projectId,
      projectName,
    };

    setSavedIdeas([newIdea, ...savedIdeas]);
    
    // Log activity if linked to a project
    if (projectId && projectName) {
      try {
        const ACTIVITY_KEY = 'project-activity';
        const activitiesStr = localStorage.getItem(ACTIVITY_KEY);
        const activities = activitiesStr ? JSON.parse(activitiesStr) : [];
        
        const newActivity: ProjectActivity = {
          id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          projectId,
          type: 'idea_added',
          description: `Added idea: "${ideaText.slice(0, 50)}${ideaText.length > 50 ? '...' : ''}"`,
          timestamp: new Date().toISOString(),
          metadata: { ideaId: newIdea.id, ideaText: ideaText.slice(0, 100) }
        };
        
        activities.push(newActivity);
        localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
      } catch (error) {
        console.error('Error logging activity:', error);
      }
    }
    
    // Reset form
    setIdeaText('');
    setSuggestedTags([]);
    setSelectedTags([]);
    setShowTagSuggestions(false);
  };

  const deleteIdea = (id: string) => {
    setSavedIdeas(prev => prev.filter(idea => idea.id !== id));
    // Update localStorage
    const updated = savedIdeas.filter(idea => idea.id !== id);
    if (updated.length === 0) {
      localStorage.removeItem('captured-ideas');
    } else {
      localStorage.setItem('captured-ideas', JSON.stringify(updated));
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Project Context Banner */}
      {projectId && projectName && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                Capturing ideas for: <span className="text-primary">{projectName}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                This idea will be automatically linked to your project
              </p>
            </div>
            <Link href={`/dashboard/${projectId}`}>
              <Button variant="outline" size="sm">
                View Project
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Capture Form */}
      <Card className="p-8 shadow-lg">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">Capture Your Idea</h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Type or paste any thought, and let AI help you organize it.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="idea-input" className="sr-only">
              Enter your idea
            </label>
            <textarea
              id="idea-input"
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="E.g., Add a referral program that gives both the referrer and referee 20% off their next purchase..."
              className="w-full min-h-[140px] p-4 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              disabled={isGenerating}
              aria-describedby="idea-hint"
            />
            <p id="idea-hint" className="text-xs text-muted-foreground">
              Describe your idea in as much detail as you'd like
            </p>
          </div>

          <Button
            onClick={generateTags}
            disabled={!ideaText.trim() || isGenerating}
            className="w-full transition-all hover:scale-[1.02] disabled:hover:scale-100"
            size="lg"
            aria-label={isGenerating ? "Analyzing your idea" : "Generate tags for your idea"}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
                Generate Tags
              </>
            )}
          </Button>

          {/* Tag Suggestions */}
          {showTagSuggestions && suggestedTags.length > 0 && (
            <div className="space-y-5 pt-6 border-t-2" role="region" aria-label="Tag suggestions">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Suggested Tags</h3>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested tag options">
                  {suggestedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/80 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
                      onClick={() => toggleTag(tag)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleTag(tag);
                        }
                      }}
                      tabIndex={0}
                      role="checkbox"
                      aria-checked={selectedTags.includes(tag)}
                      aria-label={`${tag} tag${selectedTags.includes(tag) ? ', selected' : ''}`}
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <X className="ml-1.5 h-3 w-3" aria-hidden="true" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Custom Tag Input */}
              <div className="space-y-3">
                <h3 className="font-semibold text-base">Add Custom Tag</h3>
                <div className="flex gap-2">
                  <label htmlFor="custom-tag-input" className="sr-only">
                    Enter a custom tag name
                  </label>
                  <Input
                    id="custom-tag-input"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Enter custom tag..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomTag();
                      }
                    }}
                    aria-describedby="custom-tag-hint"
                  />
                  <Button
                    onClick={addCustomTag}
                    variant="outline"
                    size="icon"
                    disabled={!customTag.trim()}
                    aria-label="Add custom tag"
                    className="transition-all hover:scale-105"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                <p id="custom-tag-hint" className="text-xs text-muted-foreground">
                  Press Enter or click + to add your custom tag
                </p>
              </div>

              {/* Selected Tags Display */}
              {selectedTags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-base">
                    Applied Tags <span className="text-muted-foreground font-normal">({selectedTags.length})</span>
                  </h3>
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Selected tags">
                    {selectedTags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="default"
                        className="text-sm py-1.5 px-3"
                        role="listitem"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={saveIdea}
                disabled={selectedTags.length === 0}
                className="w-full transition-all hover:scale-[1.02] disabled:hover:scale-100"
                variant="default"
                size="lg"
                aria-label="Save idea with selected tags"
              >
                Save Idea
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Saved Ideas List */}
      {savedIdeas.length > 0 && (
        <section className="space-y-5" aria-label="Saved ideas">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold">Your Captured Ideas</h2>
            <span className="text-sm text-muted-foreground font-medium px-3 py-1 bg-muted rounded-full">
              {savedIdeas.length} {savedIdeas.length === 1 ? 'idea' : 'ideas'}
            </span>
          </div>
          <div className="space-y-4" role="list">
            {savedIdeas.map((idea) => (
              <Card 
                key={idea.id} 
                className="p-5 hover:shadow-lg transition-all hover:border-primary/30"
                role="listitem"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-sm flex-1 leading-relaxed">{sanitizeText(idea.text)}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteIdea(idea.id)}
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label="Delete this idea"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                  {idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2" role="list" aria-label="Idea tags">
                      {idea.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="text-xs py-1 px-2.5"
                          role="listitem"
                        >
                          {sanitizeText(tag)}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <time 
                    className="text-xs text-muted-foreground block"
                    dateTime={new Date(idea.timestamp).toISOString()}
                  >
                    {formatDate(idea.timestamp)}
                  </time>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

