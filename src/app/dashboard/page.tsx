'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  LayoutDashboard, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  FolderOpen,
  Lightbulb,
  FlaskConical,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import {
  Project,
  createProject,
  updateProject,
  deleteProject,
  calculateDashboardStats,
  type DashboardStats,
} from './actions';
import { ProjectCard } from '@/components/dashboard/project-card';
import { ProjectFormModal } from '@/components/dashboard/project-form-modal';
import { DeleteConfirmDialog } from '@/components/dashboard/delete-confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STORAGE_KEY = 'dashboard-projects';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    ideasThisWeek: 0,
    experimentsInProgress: 0,
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; project: Project | null }>({
    isOpen: false,
    project: null,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Project['status']>('All');
  const [sortBy, setSortBy] = useState<'updated' | 'alphabetical' | 'status'>('updated');
  const [isLoading, setIsLoading] = useState(true);

  // Load projects from localStorage on mount
  useEffect(() => {
    const loadProjects = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProjects(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      } catch (error) {
        console.error('Error saving projects:', error);
      }
    }
  }, [projects, isLoading]);

  // Calculate stats whenever projects change
  useEffect(() => {
    const updateStats = async () => {
      try {
        // Load ideas and experiments from localStorage
        const ideasStr = localStorage.getItem('captured-ideas');
        const experimentsStr = localStorage.getItem('canvas-history');
        
        const ideas = ideasStr ? JSON.parse(ideasStr) : [];
        const experiments = experimentsStr ? JSON.parse(experimentsStr) : [];
        
        const newStats = await calculateDashboardStats(projects, ideas, experiments);
        setStats(newStats);
      } catch (error) {
        console.error('Error calculating stats:', error);
      }
    };
    
    if (!isLoading) {
      updateStats();
    }
  }, [projects, isLoading]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...projects];
    
    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      } else {
        // Sort by updated date (most recent first)
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
    
    setFilteredProjects(filtered);
  }, [projects, searchQuery, statusFilter, sortBy]);

  const handleCreateProject = async (input: any) => {
    const result = await createProject(input);
    if (result.success && result.project) {
      setProjects([...projects, result.project]);
      setIsFormOpen(false);
      return { success: true };
    }
    return result;
  };

  const handleUpdateProject = async (input: any) => {
    const result = await updateProject(input);
    if (result.success && result.project) {
      setProjects(projects.map(p => 
        p.id === input.id ? { ...p, ...result.project } : p
      ));
      setIsFormOpen(false);
      setEditingProject(null);
      return { success: true };
    }
    return result;
  };

  const handleDeleteProject = async () => {
    if (!deleteConfirm.project) return;
    
    const result = await deleteProject(deleteConfirm.project.id);
    if (result.success) {
      setProjects(projects.filter(p => p.id !== deleteConfirm.project!.id));
      setDeleteConfirm({ isOpen: false, project: null });
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (project: Project) => {
    setDeleteConfirm({ isOpen: true, project });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Project Dashboard</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Your strategic command center for all active initiatives
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold">{stats.totalProjects}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold">{stats.activeProjects}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ideas This Week</p>
              <p className="text-2xl font-bold">{stats.ideasThisWeek}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Experiments</p>
              <p className="text-2xl font-bold">{stats.experimentsInProgress}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {statusFilter === 'All' ? 'All Status' : statusFilter}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter('All')}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Active')}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Stalled')}>
                Stalled
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Validated')}>
                Validated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Idea')}>
                Idea
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Sort: {sortBy === 'updated' ? 'Last Updated' : sortBy === 'alphabetical' ? 'A-Z' : 'Status'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('updated')}>
                Last Updated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>
                Alphabetical
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('status')}>
                Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => { setEditingProject(null); setIsFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {projects.length === 0 
                ? 'Create your first project to start organizing your initiatives'
                : 'Try adjusting your search or filter criteria'}
            </p>
            {projects.length === 0 && (
              <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Project
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEditModal}
              onDelete={openDeleteConfirm}
            />
          ))}
        </div>
      )}

      {/* Quick Actions - Link to Other Features */}
      <Card className="mt-8 p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/idea-capture">
            <Button variant="outline" className="w-full justify-start gap-3">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <div className="text-left">
                <div className="font-medium">Capture New Idea</div>
                <div className="text-xs text-muted-foreground">Add ideas and link to projects</div>
              </div>
            </Button>
          </Link>
          
          <Link href="/assumption-challenger">
            <Button variant="outline" className="w-full justify-start gap-3">
              <svg className="h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-left">
                <div className="font-medium">Challenge Assumptions</div>
                <div className="text-xs text-muted-foreground">Test your thinking on projects</div>
              </div>
            </Button>
          </Link>
          
          <Link href="/experiment-canvas">
            <Button variant="outline" className="w-full justify-start gap-3">
              <FlaskConical className="h-5 w-5 text-green-600" />
              <div className="text-left">
                <div className="font-medium">Create Experiment</div>
                <div className="text-xs text-muted-foreground">Generate canvas for projects</div>
              </div>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Modals */}
      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingProject(null); }}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        project={editingProject}
        existingProjects={projects}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        projectName={deleteConfirm.project?.name || ''}
        onConfirm={handleDeleteProject}
        onCancel={() => setDeleteConfirm({ isOpen: false, project: null })}
      />
    </div>
  );
}

