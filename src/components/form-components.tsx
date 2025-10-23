'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface FormData {
  name: string;
  email: string;
  role: string;
  message: string;
  notifications: boolean;
  theme: string;
}

export function FormComponents() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: '',
    message: '',
    notifications: false,
    theme: 'light'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Form Components</h1>
          <p className="text-gray-600 leading-relaxed">
            Comprehensive form elements following our design system
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Profile Form</CardTitle>
            <CardDescription>
              All form elements styled with our minimalist design system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Text Input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              {/* Select Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Role
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                />
              </div>

              {/* Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifications"
                  checked={formData.notifications}
                  onCheckedChange={(checked) => handleInputChange('notifications', checked as boolean)}
                />
                <Label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                  Enable email notifications
                </Label>
              </div>

              {/* Radio Group */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Theme Preference</Label>
                <RadioGroup
                  value={formData.theme}
                  onValueChange={(value) => handleInputChange('theme', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="text-sm text-gray-700">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="text-sm text-gray-700">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="text-sm text-gray-700">System</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Form State Display */}
        <Card>
          <CardHeader>
            <CardTitle>Form State</CardTitle>
            <CardDescription>
              Current form data (for demonstration)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-gray-700 bg-gray-100 p-4 rounded-lg overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
