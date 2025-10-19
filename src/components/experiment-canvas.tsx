'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  History,
  X,
  FolderOpen,
} from 'lucide-react';
import { ProjectActivity } from '@/app/dashboard/actions';
import {
  generateCanvasSchema,
  validateInput,
  sanitizeText,
} from '../lib/validation';
import Link from 'next/link';

interface ExperimentCanvas {
  hypothesis: string;
  successMetric: string;
  smallestTest: string;
  timeline: string;
  resources: string[];
}

interface SavedCanvas {
  id: string;
  idea: string;
  canvas: ExperimentCanvas;
  timestamp: number;
  projectId?: string;
  projectName?: string;
}

interface ExperimentCanvasProps {
  projectId?: string;
  projectName?: string;
}

export function ExperimentCanvas({
  projectId,
  projectName,
}: ExperimentCanvasProps = {}) {
  const [ideaText, setIdeaText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [canvas, setCanvas] = useState<ExperimentCanvas | null>(null);
  const [copied, setCopied] = useState(false);
  const [editableCanvas, setEditableCanvas] = useState<ExperimentCanvas | null>(
    null
  );
  const [history, setHistory] = useState<SavedCanvas[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('canvas-history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('canvas-history', JSON.stringify(history));
    }
  }, [history]);

  // Update editable canvas when canvas changes
  useEffect(() => {
    if (canvas) {
      setEditableCanvas({ ...canvas });
    }
  }, [canvas]);

  const generateCanvas = async () => {
    if (!ideaText.trim()) return;

    // Client-side validation
    const validation = validateInput(generateCanvasSchema, { idea: ideaText });
    if (!validation.success) {
      alert(validation.error);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-canvas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: ideaText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate canvas');
      }

      const data = await response.json();
      setCanvas(data.canvas);

      // Save to history with sanitized data
      const newCanvas: SavedCanvas = {
        id: Date.now().toString(),
        idea: sanitizeText(ideaText),
        canvas: {
          hypothesis: sanitizeText(data.canvas.hypothesis),
          successMetric: sanitizeText(data.canvas.successMetric),
          smallestTest: sanitizeText(data.canvas.smallestTest),
          timeline: sanitizeText(data.canvas.timeline),
          resources: data.canvas.resources.map((r: string) => sanitizeText(r)),
        },
        timestamp: Date.now(),
        projectId,
        projectName,
      };
      setHistory([newCanvas, ...history.slice(0, 9)]); // Keep last 10

      // Log activity if linked to a project
      if (projectId && projectName) {
        try {
          const ACTIVITY_KEY = 'project-activity';
          const activitiesStr = localStorage.getItem(ACTIVITY_KEY);
          const activities = activitiesStr ? JSON.parse(activitiesStr) : [];

          const newActivity: ProjectActivity = {
            id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            projectId,
            type: 'experiment_generated',
            description: `Generated experiment: "${ideaText.slice(0, 50)}${ideaText.length > 50 ? '...' : ''}"`,
            timestamp: new Date().toISOString(),
            metadata: {
              canvasId: newCanvas.id,
              ideaText: ideaText.slice(0, 100),
            },
          };

          activities.push(newActivity);
          localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
        } catch (error) {
          console.error('Error logging activity:', error);
        }
      }
    } catch (error) {
      console.error('Error generating canvas:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportAsMarkdown = () => {
    if (!editableCanvas) return;

    const markdown = `# Experiment Canvas

## Idea
${ideaText}

## Hypothesis
${editableCanvas.hypothesis}

## Success Metric
${editableCanvas.successMetric}

## Smallest Test
${editableCanvas.smallestTest}

## Timeline
${editableCanvas.timeline}

## Resources Needed
${editableCanvas.resources.map(r => `- ${r}`).join('\n')}

---
Generated on ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment-canvas-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!editableCanvas) return;

    const text = `Experiment Canvas\n\nIdea: ${ideaText}\n\nHypothesis:\n${editableCanvas.hypothesis}\n\nSuccess Metric:\n${editableCanvas.successMetric}\n\nSmallest Test:\n${editableCanvas.smallestTest}\n\nTimeline:\n${editableCanvas.timeline}\n\nResources:\n${editableCanvas.resources.map(r => `• ${r}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setIdeaText('');
    setCanvas(null);
    setEditableCanvas(null);
  };

  const loadFromHistory = (saved: SavedCanvas) => {
    setIdeaText(saved.idea);
    setCanvas(saved.canvas);
    setShowHistory(false);
  };

  const updateField = (
    field: keyof ExperimentCanvas,
    value: string | string[]
  ) => {
    if (!editableCanvas) return;
    setEditableCanvas({
      ...editableCanvas,
      [field]: value,
    });
  };

  const addResource = () => {
    if (!editableCanvas) return;
    setEditableCanvas({
      ...editableCanvas,
      resources: [...editableCanvas.resources, ''],
    });
  };

  const updateResource = (index: number, value: string) => {
    if (!editableCanvas) return;
    const newResources = [...editableCanvas.resources];
    newResources[index] = value;
    setEditableCanvas({
      ...editableCanvas,
      resources: newResources,
    });
  };

  const removeResource = (index: number) => {
    if (!editableCanvas) return;
    setEditableCanvas({
      ...editableCanvas,
      resources: editableCanvas.resources.filter((_, i) => i !== index),
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
                Creating experiment for:{' '}
                <span className="text-primary">{projectName}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                This experiment will be automatically linked to your project
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

      {/* Input Form */}
      <Card className="p-8 shadow-lg">
        <div className="space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold">
                Describe Your Idea
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Share your concept and we&apos;ll structure it into an
                actionable experiment.
              </p>
            </div>
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="shrink-0 transition-all hover:scale-105"
                aria-label={`${showHistory ? 'Hide' : 'Show'} canvas history (${history.length} items)`}
              >
                <History className="mr-2 h-4 w-4" aria-hidden="true" />
                History ({history.length})
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="idea-textarea" className="sr-only">
              Describe your experiment idea
            </label>
            <textarea
              id="idea-textarea"
              value={ideaText}
              onChange={e => setIdeaText(e.target.value)}
              placeholder="E.g., I want to test if offering a 7-day free trial with no credit card required will increase conversion rates for our SaaS product..."
              className="w-full min-h-[140px] p-4 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              disabled={isGenerating || !!canvas}
              aria-describedby="idea-hint"
            />
            <p id="idea-hint" className="text-xs text-muted-foreground">
              Include your goal, target audience, and what success looks like
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={generateCanvas}
              disabled={!ideaText.trim() || isGenerating || !!canvas}
              className="flex-1 transition-all hover:scale-[1.02] disabled:hover:scale-100"
              size="lg"
              aria-label={
                isGenerating
                  ? 'Generating canvas'
                  : 'Generate experiment canvas'
              }
            >
              {isGenerating ? (
                <>
                  <Loader2
                    className="mr-2 h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                  Generating Canvas...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
                  Generate Experiment Canvas
                </>
              )}
            </Button>
            {canvas && (
              <Button
                onClick={resetForm}
                variant="outline"
                size="lg"
                className="transition-all hover:scale-105"
                aria-label="Clear and create new canvas"
              >
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                New Canvas
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Canvas Display */}
      {editableCanvas && (
        <Card
          className="p-8 shadow-lg"
          role="region"
          aria-label="Experiment canvas"
        >
          <div className="space-y-8">
            <div className="flex justify-between items-center gap-4">
              <h2 className="text-2xl font-bold">Your Experiment Canvas</h2>
              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="transition-all hover:scale-105"
                  aria-label={
                    copied
                      ? 'Canvas copied to clipboard'
                      : 'Copy canvas to clipboard'
                  }
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={exportAsMarkdown}
                  variant="outline"
                  size="sm"
                  className="transition-all hover:scale-105"
                  aria-label="Download canvas as markdown file"
                >
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                  Download
                </Button>
              </div>
            </div>

            {/* Hypothesis */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-base px-3 py-1">
                  1
                </Badge>
                <Label
                  htmlFor="hypothesis-field"
                  className="text-lg font-semibold"
                >
                  Hypothesis
                </Label>
              </div>
              <textarea
                id="hypothesis-field"
                value={editableCanvas.hypothesis}
                onChange={e => updateField('hypothesis', e.target.value)}
                className="w-full min-h-[100px] p-4 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                aria-describedby="hypothesis-hint"
              />
              <p id="hypothesis-hint" className="text-xs text-muted-foreground">
                Format: &quot;If [action], then [outcome], because
                [reasoning]&quot;
              </p>
            </div>

            {/* Success Metric */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-base px-3 py-1">
                  2
                </Badge>
                <Label htmlFor="metric-field" className="text-lg font-semibold">
                  Success Metric
                </Label>
              </div>
              <Input
                id="metric-field"
                value={editableCanvas.successMetric}
                onChange={e => updateField('successMetric', e.target.value)}
                className="text-base transition-all"
                aria-describedby="metric-hint"
              />
              <p id="metric-hint" className="text-xs text-muted-foreground">
                One measurable metric to validate success
              </p>
            </div>

            {/* Smallest Test */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-base px-3 py-1">
                  3
                </Badge>
                <Label htmlFor="test-field" className="text-lg font-semibold">
                  Smallest Possible Test
                </Label>
              </div>
              <textarea
                id="test-field"
                value={editableCanvas.smallestTest}
                onChange={e => updateField('smallestTest', e.target.value)}
                className="w-full min-h-[120px] p-4 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                aria-describedby="test-hint"
              />
              <p id="test-hint" className="text-xs text-muted-foreground">
                The minimal viable way to test your hypothesis
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-base px-3 py-1">
                  4
                </Badge>
                <Label
                  htmlFor="timeline-field"
                  className="text-lg font-semibold"
                >
                  Timeline
                </Label>
              </div>
              <Input
                id="timeline-field"
                value={editableCanvas.timeline}
                onChange={e => updateField('timeline', e.target.value)}
                className="text-base transition-all"
                placeholder="e.g., 1-2 weeks"
              />
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-base px-3 py-1">
                    5
                  </Badge>
                  <Label className="text-lg font-semibold">
                    Resources Needed
                  </Label>
                </div>
                <Button
                  onClick={addResource}
                  variant="outline"
                  size="sm"
                  className="transition-all hover:scale-105"
                  aria-label="Add another resource"
                >
                  + Add Resource
                </Button>
              </div>
              <div
                className="space-y-3"
                role="list"
                aria-label="Required resources"
              >
                {editableCanvas.resources.map((resource, index) => (
                  <div key={index} className="flex gap-2" role="listitem">
                    <label htmlFor={`resource-${index}`} className="sr-only">
                      Resource {index + 1}
                    </label>
                    <Input
                      id={`resource-${index}`}
                      value={resource}
                      onChange={e => updateResource(index, e.target.value)}
                      className="text-base transition-all"
                      placeholder="e.g., Landing page builder"
                    />
                    {editableCanvas.resources.length > 1 && (
                      <Button
                        onClick={() => removeResource(index)}
                        variant="ghost"
                        size="icon"
                        className="shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        aria-label={`Remove resource ${index + 1}`}
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <aside
              className="pt-4 border-t-2 p-4 bg-muted/50 rounded-lg border-dashed border-2"
              aria-label="Tip"
            >
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                <strong className="text-foreground not-italic">💡 Tip:</strong>{' '}
                Edit any field to customize your experiment. Download or copy
                when ready to execute.
              </p>
            </aside>
          </div>
        </Card>
      )}

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <Card
          className="p-8 shadow-lg"
          role="region"
          aria-label="Canvas history"
        >
          <h3 className="text-xl font-bold mb-5">Recent Canvases</h3>
          <div className="space-y-3" role="list">
            {history.map(saved => (
              <Card
                key={saved.id}
                className="p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer focus-within:ring-2 focus-within:ring-primary/20"
                role="listitem"
                onClick={() => loadFromHistory(saved)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    loadFromHistory(saved);
                  }
                }}
                tabIndex={0}
                aria-label={`Load canvas from ${formatDate(saved.timestamp)}`}
              >
                <div className="space-y-3">
                  <p className="text-sm font-medium line-clamp-2 leading-relaxed">
                    {saved.idea}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="text-xs">
                      Canvas
                    </Badge>
                    <time
                      className="text-xs text-muted-foreground"
                      dateTime={new Date(saved.timestamp).toISOString()}
                    >
                      {formatDate(saved.timestamp)}
                    </time>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
