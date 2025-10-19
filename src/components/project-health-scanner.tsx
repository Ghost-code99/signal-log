'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity, Plus, X, Copy, Check, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { scanProjectsSchema, validateInput, sanitizeText } from '../lib/validation';

interface Project {
  name: string;
  description: string;
}

interface ProjectAnalysis {
  projectName: string;
  status: 'ready' | 'needs_attention' | 'stalled';
  statusLabel: string;
  riskFlags: string[];
  nextSteps: string[];
}

// Mock data for Stage 1 (UI only)
const MOCK_ANALYSES: ProjectAnalysis[] = [
  {
    projectName: 'Cold Email Campaign',
    status: 'needs_attention',
    statusLabel: 'Needs Validation',
    riskFlags: [
      '5% reply rate assumption is very aggressive for cold outreach',
      '200 contacts may be too small a sample size',
      'No mention of email deliverability/spam risk'
    ],
    nextSteps: [
      'Research industry benchmarks (typical reply rates are 1-2%)',
      'Test email copy with 20 contacts before scaling',
      'Set up email warmup to protect sender reputation'
    ]
  },
  {
    projectName: 'Landing Page Redesign',
    status: 'ready',
    statusLabel: 'Ready to Test',
    riskFlags: [
      'Doubling conversion rate is ambitious without data',
      'No A/B test plan mentioned'
    ],
    nextSteps: [
      'Set up A/B test with 50/50 traffic split',
      'Define success criteria (min sample size, confidence level)',
      'Ship within 1 week to maintain momentum'
    ]
  },
  {
    projectName: 'Pricing Experiment',
    status: 'stalled',
    statusLabel: 'Stalled—Needs Action',
    riskFlags: [
      '10 beta users is too small for pricing signal',
      'No timeline for decision mentioned',
      'Feedback collection method unclear'
    ],
    nextSteps: [
      'Expand beta to 30+ users for meaningful data',
      'Create structured survey to gauge willingness to pay',
      'Set decision deadline (e.g., 2 weeks) to avoid analysis paralysis'
    ]
  }
];

const STATUS_COLORS = {
  ready: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  needs_attention: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  stalled: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
};

export function ProjectHealthScanner() {
  const [projects, setProjects] = useState<Project[]>([
    { name: '', description: '' },
    { name: '', description: '' },
    { name: '', description: '' }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState<ProjectAnalysis[] | null>(null);
  const [copied, setCopied] = useState(false);

  const addProject = () => {
    if (projects.length < 5) {
      setProjects([...projects, { name: '', description: '' }]);
    }
  };

  const removeProject = (index: number) => {
    if (projects.length > 3) {
      const newProjects = projects.filter((_, i) => i !== index);
      setProjects(newProjects);
    }
  };

  const updateProject = (index: number, field: 'name' | 'description', value: string) => {
    const newProjects = [...projects];
    const maxLength = field === 'name' ? 60 : 300;
    newProjects[index][field] = value.slice(0, maxLength);
    setProjects(newProjects);
  };

  const isFormValid = () => {
    const filledProjects = projects.filter(p => p.name.trim() && p.description.trim());
    return filledProjects.length >= 3;
  };

  const analyzeProjects = async () => {
    const validProjects = projects.filter(p => p.name.trim() && p.description.trim());
    
    // Client-side validation
    const validation = validateInput(scanProjectsSchema, { projects: validProjects });
    if (!validation.success) {
      alert(validation.error);
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/scan-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: validProjects }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze projects');
      }

      const data = await response.json();
      setAnalyses(data.analyses || []);
    } catch (error) {
      console.error('Error analyzing projects:', error);
      // Show fallback analysis
      const mockResults = validProjects
        .slice(0, 3)
        .map((project, index) => ({
          ...MOCK_ANALYSES[index],
          projectName: sanitizeText(project.name)
        }));
      setAnalyses(mockResults);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyAllResults = () => {
    if (!analyses) return;

    const text = analyses
      .map(
        (analysis) => `
${analysis.projectName}
Status: ${analysis.statusLabel}

Risk Flags:
${analysis.riskFlags.map((flag) => `• ${flag}`).join('\n')}

Next Steps:
${analysis.nextSteps.map((step) => `• ${step}`).join('\n')}
---
`
      )
      .join('\n');

    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startOver = () => {
    setProjects([
      { name: '', description: '' },
      { name: '', description: '' },
      { name: '', description: '' }
    ]);
    setAnalyses(null);
  };

  const loadSampleData = () => {
    setProjects([
      { 
        name: 'Cold Email Campaign', 
        description: 'Testing outbound sales via personalized cold emails to 200 SMB founders. Goal: 5% reply rate.' 
      },
      { 
        name: 'Landing Page Redesign', 
        description: 'Simplifying hero section and adding social proof. Hypothesis: Conversion rate will increase from 2% to 4%.' 
      },
      { 
        name: 'Pricing Experiment', 
        description: 'Testing $49/mo vs $99/mo tiers. Currently getting feedback from 10 beta users.' 
      }
    ]);
  };

  const getCharCount = (text: string, max: number) => {
    return `${text.length}/${max}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16 space-y-6">
          <div 
            className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-xl mb-6 transition-transform hover:scale-105"
            aria-hidden="true"
          >
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            AI Project Health Scanner
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Get instant triage on your active projects. AI analyzes your portfolio and provides
            status signals, risk flags, and actionable next steps.
          </p>
        </header>

        {/* Results View */}
        {analyses ? (
          <div className="space-y-8" role="region" aria-label="Project analysis results">
            {/* Action Buttons */}
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                onClick={copyAllResults}
                variant="outline"
                className="gap-2 transition-all hover:scale-105"
                aria-label={copied ? "Results copied to clipboard" : "Copy all results to clipboard"}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    Copy All Results
                  </>
                )}
              </Button>
              <Button
                onClick={startOver}
                variant="outline"
                className="gap-2 transition-all hover:scale-105"
                aria-label="Clear results and analyze new projects"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Start Over
              </Button>
            </div>

            {/* Results Grid */}
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {analyses.map((analysis, index) => (
                <Card 
                  key={index} 
                  className="p-6 space-y-5 transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-primary/20"
                  role="article"
                  aria-labelledby={`project-title-${index}`}
                >
                  {/* Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 
                        id={`project-title-${index}`}
                        className="text-xl font-semibold flex-1 leading-tight"
                      >
                        {sanitizeText(analysis.projectName)}
                      </h3>
                      <Badge 
                        className={STATUS_COLORS[analysis.status]}
                        role="status"
                        aria-label={`Project status: ${analysis.statusLabel}`}
                      >
                        {sanitizeText(analysis.statusLabel)}
                      </Badge>
                    </div>
                  </div>

                  {/* Risk Flags */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                      Risk Flags
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground" role="list">
                      {analysis.riskFlags.map((flag, i) => (
                        <li key={i} className="flex gap-3 leading-relaxed">
                          <span className="text-red-500 shrink-0 mt-0.5" aria-hidden="true">•</span>
                          <span>{sanitizeText(flag)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Next Steps */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      Next Steps
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground" role="list">
                      {analysis.nextSteps.map((step, i) => (
                        <li key={i} className="flex gap-3 leading-relaxed">
                          <span className="text-blue-500 shrink-0 mt-0.5" aria-hidden="true">•</span>
                          <span>{sanitizeText(step)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Input Form */
          <Card className="p-8 shadow-lg">
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-semibold">
                  Add Your Active Projects
                </h2>
                <p className="text-base text-muted-foreground">
                  Enter 3-5 projects to get AI-powered health assessments
                </p>
                <Button
                  onClick={loadSampleData}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  aria-label="Load sample project data"
                >
                  ✨ Try Sample Data
                </Button>
              </div>

              {/* Project Entries */}
              <div className="space-y-6" role="list" aria-label="Project entries">
                {projects.map((project, index) => (
                  <div 
                    key={index} 
                    className="relative p-5 border-2 rounded-lg space-y-4 transition-all hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                    role="listitem"
                  >
                    {/* Header with Remove Button */}
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">
                        Project {index + 1}
                        {index < 3 && <span className="sr-only">(required)</span>}
                      </Label>
                      {projects.length > 3 && (
                        <Button
                          onClick={() => removeProject(index)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label={`Remove project ${index + 1}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Project Name */}
                    <div className="space-y-2">
                      <Label htmlFor={`project-name-${index}`} className="text-sm font-medium">
                        Project Name <span className="text-destructive" aria-label="required">*</span>
                      </Label>
                      <Input
                        id={`project-name-${index}`}
                        value={project.name}
                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                        placeholder="e.g., Cold Email Campaign"
                        maxLength={60}
                        className="transition-all"
                        aria-required="true"
                        aria-describedby={`project-name-${index}-count`}
                      />
                      <p 
                        id={`project-name-${index}-count`}
                        className="text-xs text-muted-foreground text-right"
                        aria-live="polite"
                      >
                        {getCharCount(project.name, 60)}
                      </p>
                    </div>

                    {/* Project Description */}
                    <div className="space-y-2">
                      <Label htmlFor={`project-desc-${index}`} className="text-sm font-medium">
                        Description <span className="text-destructive" aria-label="required">*</span>
                      </Label>
                      <Textarea
                        id={`project-desc-${index}`}
                        value={project.description}
                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                        placeholder="Brief description of what you're testing, your goal, and current status..."
                        maxLength={300}
                        rows={3}
                        className="transition-all resize-none"
                        aria-required="true"
                        aria-describedby={`project-desc-${index}-count`}
                      />
                      <p 
                        id={`project-desc-${index}-count`}
                        className="text-xs text-muted-foreground text-right"
                        aria-live="polite"
                      >
                        {getCharCount(project.description, 300)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Project Button */}
              {projects.length < 5 && (
                <Button
                  onClick={addProject}
                  variant="outline"
                  className="w-full gap-2 transition-all hover:scale-[1.02]"
                  aria-label="Add another project (maximum 5)"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Add Another Project ({projects.length}/5)
                </Button>
              )}

              {/* Submit Button */}
              <Button
                onClick={analyzeProjects}
                disabled={!isFormValid() || isAnalyzing}
                className="w-full gap-2 transition-all hover:scale-[1.02] disabled:hover:scale-100"
                size="lg"
                aria-label={isAnalyzing ? "Analysis in progress" : "Analyze all projects"}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    Analyzing Your Portfolio...
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" aria-hidden="true" />
                    Analyze My Portfolio
                  </>
                )}
              </Button>

              {/* Validation Message */}
              {!isFormValid() && (
                <p 
                  className="text-sm text-center text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  Please fill in at least 3 projects to continue
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Info Box */}
        <aside 
          className="mt-8 p-5 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20"
          aria-label="Usage tip"
        >
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            <strong className="text-foreground">💡 Pro tip:</strong> Be specific about your goals, metrics, and current status 
            for more targeted advice. This is a UI preview—results use mock data for demonstration.
          </p>
        </aside>
      </div>
    </div>
  );
}
