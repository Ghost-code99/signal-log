'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableCaption 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  status: 'active' | 'stalled' | 'completed' | 'planning';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  progress: number;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    status: 'active',
    priority: 'high',
    assignee: 'John Doe',
    dueDate: '2024-02-15',
    progress: 75
  },
  {
    id: '2',
    name: 'Mobile App Development',
    status: 'planning',
    priority: 'medium',
    assignee: 'Jane Smith',
    dueDate: '2024-03-01',
    progress: 25
  },
  {
    id: '3',
    name: 'API Integration',
    status: 'stalled',
    priority: 'low',
    assignee: 'Mike Johnson',
    dueDate: '2024-01-30',
    progress: 60
  },
  {
    id: '4',
    name: 'Database Migration',
    status: 'completed',
    priority: 'high',
    assignee: 'Sarah Wilson',
    dueDate: '2024-01-15',
    progress: 100
  },
  {
    id: '5',
    name: 'User Authentication',
    status: 'active',
    priority: 'medium',
    assignee: 'Alex Brown',
    dueDate: '2024-02-28',
    progress: 40
  }
];

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
  stalled: { label: 'Stalled', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  completed: { label: 'Completed', color: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20' },
  planning: { label: 'Planning', color: 'bg-violet-500/10 text-violet-700 border-violet-500/20' }
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-red-100 text-red-700' }
};

export function DataDisplayComponents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Data Display Components</h1>
          <p className="text-gray-600 leading-relaxed">
            Tables and data visualization following our design system
          </p>
        </div>

        {/* Data Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>Projects Table</CardTitle>
            <CardDescription>
              Interactive data table with filtering and search capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="stalled">Stalled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.name}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs font-medium",
                            statusConfig[project.status].color
                          )}
                        >
                          {statusConfig[project.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={cn(
                            "text-xs font-medium",
                            priorityConfig[project.priority].color
                          )}
                        >
                          {priorityConfig[project.priority].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{project.assignee}</TableCell>
                      <TableCell>{project.dueDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{project.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No projects found matching your criteria.</p>
              </div>
            )}

            <TableCaption>
              Showing {filteredProjects.length} of {mockProjects.length} projects
            </TableCaption>
          </CardContent>
        </Card>

        {/* List View Card */}
        <Card>
          <CardHeader>
            <CardTitle>List View</CardTitle>
            <CardDescription>
              Alternative list layout for the same data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProjects.slice(0, 3).map((project) => (
                <div 
                  key={project.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs font-medium",
                          statusConfig[project.status].color
                        )}
                      >
                        {statusConfig[project.status].label}
                      </Badge>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          "text-xs font-medium",
                          priorityConfig[project.priority].color
                        )}
                      >
                        {priorityConfig[project.priority].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Assigned to {project.assignee}</span>
                      <span>Due {project.dueDate}</span>
                      <span>{project.progress}% complete</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
