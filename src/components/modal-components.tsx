'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

export function ModalComponents() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Modal form submitted:', formData);
    setIsOpen(false);
    setFormData({ title: '', description: '', priority: 'medium' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Modal Components</h1>
          <p className="text-gray-600 leading-relaxed">
            Various modal and dialog examples following our design system
          </p>
        </div>

        {/* Modal Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Modal */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Modal</CardTitle>
              <CardDescription>
                Simple modal with form content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button>Open Basic Modal</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Fill out the form below to create a new project.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                        Project Title
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter project title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Enter project description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </form>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      Create Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Confirmation Modal */}
          <Card>
            <CardHeader>
              <CardTitle>Confirmation Modal</CardTitle>
              <CardDescription>
                Modal for confirming destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">Delete Item</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete the project.
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <DialogFooter>
                    <Button variant="outline">
                      Cancel
                    </Button>
                    <Button variant="destructive">
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Info Modal */}
          <Card>
            <CardHeader>
              <CardTitle>Info Modal</CardTitle>
              <CardDescription>
                Modal for displaying information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Show Info</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Info className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <DialogTitle>Project Information</DialogTitle>
                        <DialogDescription>
                          Here are the details about your project.
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Project Details</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Status: Active</li>
                        <li>• Created: 2 days ago</li>
                        <li>• Last updated: 1 hour ago</li>
                        <li>• Team members: 3</li>
                      </ul>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline">
                      Close
                    </Button>
                    <Button>
                      View Details
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Success Modal */}
          <Card>
            <CardHeader>
              <CardTitle>Success Modal</CardTitle>
              <CardDescription>
                Modal for successful actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Complete Action</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <DialogTitle>Success!</DialogTitle>
                        <DialogDescription>
                          Your project has been created successfully.
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <div className="text-center py-4">
                    <p className="text-gray-600">
                      You can now start working on your new project.
                    </p>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline">
                      Close
                    </Button>
                    <Button>
                      Go to Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
