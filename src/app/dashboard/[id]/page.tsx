'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Lightbulb,
  Target,
  FlaskConical,
  Clock,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import {
  Project,
  ProjectActivity,
  Idea,
  Experiment,
  Assumption,
} from '@/app/dashboard/actions';
import { ProjectFormModal } from '@/components/dashboard/project-form-modal';
import { DeleteConfirmDialog } from '@/components/dashboard/delete-confirm-dialog';
import { updateProject, deleteProject } from '@/app/dashboard/actions';

const STORAGE_KEY = 'dashboard-projects';
const ACTIVITY_KEY = 'project-activity';

const STATUS_COLORS = {
  Active:
    'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  Stalled:
    'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  Validated:
    'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  Idea: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
};

type TabType = 'overview' | 'ideas' | 'assumptions' | 'experiments';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [linkedIdeas, setLinkedIdeas] = useState<Idea[]>([]);
  const [linkedAssumptions, setLinkedAssumptions] = useState<Assumption[]>([]);
  const [linkedExperiments, setLinkedExperiments] = useState<Experiment[]>([]);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load project and linked data
  useEffect(() => {
    const loadProjectData = () => {
      try {
        // Load all projects
        const projectsStr = localStorage.getItem(STORAGE_KEY);
        const projects = projectsStr ? JSON.parse(projectsStr) : [];
        setAllProjects(projects);

        // Find this project
        const currentProject = projects.find(
          (p: Project) => p.id === projectId
        );
        if (!currentProject) {
          router.push('/dashboard');
          return;
        }
        setProject(currentProject);

        // Load activities
        const activitiesStr = localStorage.getItem(ACTIVITY_KEY);
        const allActivities = activitiesStr ? JSON.parse(activitiesStr) : [];
        const projectActivities = allActivities
          .filter((a: ProjectActivity) => a.projectId === projectId)
          .sort(
            (a: ProjectActivity, b: ProjectActivity) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        setActivities(projectActivities);

        // Load linked items
        const ideasStr = localStorage.getItem('captured-ideas');
        const ideas = ideasStr ? JSON.parse(ideasStr) : [];
        setLinkedIdeas(
          ideas.filter(
            (i: Idea & { projectId?: string }) => i.projectId === projectId
          )
        );

        const assumptionsStr = localStorage.getItem('challenge-history');
        const assumptions = assumptionsStr ? JSON.parse(assumptionsStr) : [];
        setLinkedAssumptions(
          assumptions.filter(
            (a: Assumption & { projectId?: string }) =>
              a.projectId === projectId
          )
        );

        const experimentsStr = localStorage.getItem('canvas-history');
        const experiments = experimentsStr ? JSON.parse(experimentsStr) : [];
        setLinkedExperiments(
          experiments.filter(
            (e: Experiment & { projectId?: string }) =>
              e.projectId === projectId
          )
        );
      } catch (error) {
        console.error('Error loading project data:', error);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, router]);

  const handleUpdate = async (input: {
    id?: string;
    name: string;
    description: string;
    status: Project['status'];
    tags: string[];
  }) => {
    // Ensure id is provided for update operations
    const updateInput = { ...input, id: input.id || projectId };
    const result = await updateProject(updateInput);
    if (result.success && result.project) {
      const updatedProjects = allProjects.map(p =>
        p.id === projectId ? { ...p, ...result.project } : p
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
      setProject({ ...project!, ...result.project });
      setAllProjects(updatedProjects);
      setIsEditOpen(false);
      return { success: true };
    }
    return result;
  };

  const handleDelete = async () => {
    const result = await deleteProject(projectId);
    if (result.success) {
      const updatedProjects = allProjects.filter(p => p.id !== projectId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
      router.push('/dashboard');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const tabs: {
    id: TabType;
    label: string;
    count?: number;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'overview', label: 'Overview', icon: Clock },
    { id: 'ideas', label: 'Ideas', count: linkedIdeas.length, icon: Lightbulb },
    {
      id: 'assumptions',
      label: 'Assumptions',
      count: linkedAssumptions.length,
      icon: Target,
    },
    {
      id: 'experiments',
      label: 'Experiments',
      count: linkedExperiments.length,
      icon: FlaskConical,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Project Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge className={STATUS_COLORS[project.status]}>
                {project.status}
              </Badge>
            </div>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href={`/idea-capture?projectId=${projectId}&projectName=${encodeURIComponent(project.name)}`}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-4"
                  >
                    <Lightbulb className="h-5 w-5 text-purple-600 shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">Add Idea</div>
                      <div className="text-xs text-muted-foreground">
                        Capture new idea for this project
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link
                  href={`/assumption-challenger?projectId=${projectId}&projectName=${encodeURIComponent(project.name)}`}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-4"
                  >
                    <Target className="h-5 w-5 text-amber-600 shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">Challenge Assumptions</div>
                      <div className="text-xs text-muted-foreground">
                        Test your thinking
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link
                  href={`/experiment-canvas?projectId=${projectId}&projectName=${encodeURIComponent(project.name)}`}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-4"
                  >
                    <FlaskConical className="h-5 w-5 text-green-600 shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">Create Experiment</div>
                      <div className="text-xs text-muted-foreground">
                        Generate experiment canvas
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Activity Timeline */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              {activities.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No activity yet. Start by adding ideas, challenges, or
                  experiments.
                </p>
              ) : (
                <div className="space-y-4">
                  {activities.slice(0, 10).map(activity => (
                    <div key={activity.id} className="flex gap-4 items-start">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {activity.type === 'idea_added' && (
                          <Lightbulb className="h-4 w-4 text-purple-600" />
                        )}
                        {activity.type === 'assumption_challenged' && (
                          <Target className="h-4 w-4 text-amber-600" />
                        )}
                        {activity.type === 'experiment_generated' && (
                          <FlaskConical className="h-4 w-4 text-green-600" />
                        )}
                        {activity.type === 'project_created' && (
                          <Plus className="h-4 w-4 text-primary" />
                        )}
                        {activity.type === 'status_changed' && (
                          <Edit2 className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'ideas' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Linked Ideas</h2>
              <Link
                href={`/idea-capture?projectId=${projectId}&projectName=${encodeURIComponent(project.name)}`}
              >
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Idea
                </Button>
              </Link>
            </div>
            {linkedIdeas.length === 0 ? (
              <div className="text-center py-12">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No ideas linked to this project yet
                </p>
                <Link
                  href={`/idea-capture?projectId=${projectId}&projectName=${encodeURIComponent(project.name)}`}
                >
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Capture Your First Idea
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {linkedIdeas.map(idea => (
                  <Card key={idea.id} className="p-4">
                    <p className="mb-2">{idea.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {idea.tags?.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatTimestamp(idea.timestamp)}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'assumptions' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Challenged Assumptions</h2>
              <Link
                href={`/assumption-challenger?projectId=${projectId}&projectName=${encodeURIComponent(project.name)}`}
              >
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Challenge Assumptions
                </Button>
              </Link>
            </div>
            {linkedAssumptions.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No assumptions challenged yet
                </p>
                <Link
                  href={`/assumption-challenger?projectId=${projectId}&projectName=${encodeURIComponent(project.name)}`}
                >
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Start Challenging Assumptions
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {linkedAssumptions.map(assumption => (
                  <Card key={assumption.id} className="p-4">
                    <p className="font-medium mb-2">{assumption.idea}</p>
                    <div className="space-y-2">
                      {assumption.questions
                        ?.slice(0, 3)
                        .map((q: string, i: number) => (
                          <p
                            key={i}
                            className="text-sm text-muted-foreground pl-4 border-l-2 border-amber-500/50"
                          >
                            {q}
                          </p>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatTimestamp(assumption.timestamp)}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'experiments' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Experiments</h2>
              <Link
                href={`/experiment-canvas?projectId=${projectId}&projectName=${encodeURIComponent(project.name)}`}
              >
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Experiment
                </Button>
              </Link>
            </div>
            {linkedExperiments.length === 0 ? (
              <div className="text-center py-12">
                <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No experiments created yet
                </p>
                <Link
                  href={`/experiment-canvas?projectId=${projectId}&projectName=${encodeURIComponent(project.name)}`}
                >
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Generate Your First Experiment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {linkedExperiments.map(experiment => (
                  <Card key={experiment.id} className="p-4">
                    <h3 className="font-semibold mb-2">Experiment Canvas</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Hypothesis:</span>
                        <p className="text-muted-foreground">
                          {experiment.canvas?.hypothesis || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Success Metric:</span>
                        <p className="text-muted-foreground">
                          {experiment.canvas?.successMetric || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatTimestamp(experiment.timestamp)}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Modals */}
      <ProjectFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
        project={project}
        existingProjects={allProjects}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        projectName={project.name}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
