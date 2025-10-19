'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Copy, Check, History, AlertCircle, FolderOpen } from 'lucide-react';
import { ProjectActivity } from '@/app/dashboard/actions';
import { challengeIdeaSchema, validateInput, sanitizeText } from '../lib/validation';
import Link from 'next/link';

interface Challenge {
  id: string;
  idea: string;
  questions: string[];
  timestamp: number;
  projectId?: string;
  projectName?: string;
}

interface AssumptionChallengerProps {
  projectId?: string;
  projectName?: string;
}

export function AssumptionChallenger({ projectId, projectName }: AssumptionChallengerProps = {}) {
  const [ideaText, setIdeaText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [showChallenges, setShowChallenges] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<Challenge[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('challenge-history');
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
      localStorage.setItem('challenge-history', JSON.stringify(history));
    }
  }, [history]);

  const challengeIdea = async () => {
    if (!ideaText.trim()) return;

    // Client-side validation
    const validation = validateInput(challengeIdeaSchema, { idea: ideaText });
    if (!validation.success) {
      alert(validation.error);
      return;
    }

    setIsGenerating(true);
    setShowChallenges(true);

    try {
      const response = await fetch('/api/challenge-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: ideaText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate challenges');
      }

      const data = await response.json();
      const questions = data.questions || [];
      
      setChallenges(questions);

      // Save to history with sanitized data
      const newChallenge: Challenge = {
        id: Date.now().toString(),
        idea: sanitizeText(ideaText),
        questions: questions.map((q: string) => sanitizeText(q)),
        timestamp: Date.now(),
        projectId,
        projectName,
      };
      setHistory([newChallenge, ...history.slice(0, 9)]); // Keep last 10

      // Log activity if linked to a project
      if (projectId && projectName) {
        try {
          const ACTIVITY_KEY = 'project-activity';
          const activitiesStr = localStorage.getItem(ACTIVITY_KEY);
          const activities = activitiesStr ? JSON.parse(activitiesStr) : [];
          
          const newActivity: ProjectActivity = {
            id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            projectId,
            type: 'assumption_challenged',
            description: `Challenged assumption: "${ideaText.slice(0, 50)}${ideaText.length > 50 ? '...' : ''}"`,
            timestamp: new Date().toISOString(),
            metadata: { challengeId: newChallenge.id, ideaText: ideaText.slice(0, 100) }
          };
          
          activities.push(newActivity);
          localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
        } catch (error) {
          console.error('Error logging activity:', error);
        }
      }
    } catch (error) {
      console.error('Error generating challenges:', error);
      const fallback = [
        'What evidence supports your core assumptions?',
        'What is the biggest risk you might be overlooking?',
        'Who has tried this before and what happened?',
        'What are you NOT seeing about this opportunity?',
      ];
      setChallenges(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const text = `Idea: ${ideaText}\n\nChallenging Questions:\n${challenges.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setIdeaText('');
    setChallenges([]);
    setShowChallenges(false);
  };

  const loadFromHistory = (challenge: Challenge) => {
    setIdeaText(challenge.idea);
    setChallenges(challenge.questions);
    setShowChallenges(true);
    setShowHistory(false);
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
                Challenging assumptions for: <span className="text-primary">{projectName}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                This challenge will be automatically linked to your project
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

      {/* Main Challenge Form */}
      <Card className="p-8 shadow-lg">
        <div className="space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold">Challenge Your Thinking</h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Share your idea and let AI ask the hard questions you might be avoiding.
              </p>
            </div>
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="shrink-0 transition-all hover:scale-105"
                aria-label={`${showHistory ? 'Hide' : 'Show'} challenge history (${history.length} items)`}
              >
                <History className="mr-2 h-4 w-4" aria-hidden="true" />
                History ({history.length})
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="idea-textarea" className="sr-only">
              Enter your idea to challenge
            </label>
            <textarea
              id="idea-textarea"
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="E.g., I want to build a marketplace for freelance AI consultants. We'll take 15% commission on each project and focus on mid-market companies who can't afford full-time AI teams..."
              className="w-full min-h-[160px] p-4 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              disabled={isGenerating}
              aria-describedby="idea-hint"
            />
            <p id="idea-hint" className="text-xs text-muted-foreground">
              Be detailed about your assumptions, target market, and business model
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={challengeIdea}
              disabled={!ideaText.trim() || isGenerating}
              className="flex-1 transition-all hover:scale-[1.02] disabled:hover:scale-100"
              size="lg"
              aria-label={isGenerating ? "Analyzing your idea" : "Challenge my thinking"}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
                  Challenge My Thinking
                </>
              )}
            </Button>
            {showChallenges && (
              <Button
                onClick={resetForm}
                variant="outline"
                size="lg"
                className="transition-all hover:scale-105"
                aria-label="Clear and start over"
              >
                Start Over
              </Button>
            )}
          </div>

          {/* Challenge Results */}
          {showChallenges && challenges.length > 0 && (
            <div className="space-y-5 pt-6 border-t-2" role="region" aria-label="Critical questions">
              <div className="flex justify-between items-center gap-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  Critical Questions to Consider
                </h3>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="transition-all hover:scale-105"
                  aria-label={copied ? "Questions copied to clipboard" : "Copy all questions to clipboard"}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                      Copy All
                    </>
                  )}
                </Button>
              </div>

              <ol className="space-y-3" role="list">
                {challenges.map((question, index) => (
                  <li key={index}>
                    <Card className="p-5 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900 transition-all hover:shadow-md">
                      <div className="flex gap-4">
                        <Badge 
                          variant="outline" 
                          className="h-7 shrink-0 font-semibold border-amber-600 dark:border-amber-400 text-amber-700 dark:text-amber-300"
                          aria-label={`Question ${index + 1}`}
                        >
                          {index + 1}
                        </Badge>
                        <p className="text-sm font-medium leading-relaxed flex-1">
                          {sanitizeText(question)}
                        </p>
                      </div>
                    </Card>
                  </li>
                ))}
              </ol>

              <aside 
                className="pt-4 p-4 bg-muted/50 rounded-lg border-dashed border-2"
                aria-label="Tip"
              >
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  <strong className="text-foreground not-italic">💡 Take time to honestly answer each question.</strong> Strong ideas survive scrutiny and become stronger through critical examination.
                </p>
              </aside>
            </div>
          )}
        </div>
      </Card>

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <Card className="p-8 shadow-lg" role="region" aria-label="Challenge history">
          <h3 className="text-xl font-bold mb-5">Recent Challenges</h3>
          <div className="space-y-3" role="list">
            {history.map((challenge) => (
              <Card
                key={challenge.id}
                className="p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer focus-within:ring-2 focus-within:ring-primary/20"
                role="listitem"
                onClick={() => loadFromHistory(challenge)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    loadFromHistory(challenge);
                  }
                }}
                tabIndex={0}
                aria-label={`Load challenge from ${formatDate(challenge.timestamp)}`}
              >
                <div className="space-y-3">
                  <p className="text-sm font-medium line-clamp-2 leading-relaxed">
                    {challenge.idea}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="text-xs">
                      {challenge.questions.length} {challenge.questions.length === 1 ? 'question' : 'questions'}
                    </Badge>
                    <time 
                      className="text-xs text-muted-foreground"
                      dateTime={new Date(challenge.timestamp).toISOString()}
                    >
                      {formatDate(challenge.timestamp)}
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
