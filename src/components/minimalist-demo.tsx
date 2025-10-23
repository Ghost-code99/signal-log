import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function MinimalistDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Minimalist UI Components</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Clean, modern components inspired by minimalist design principles. 
            Featuring subtle shadows, clean typography, and plenty of whitespace.
          </p>
        </div>

        {/* Cards Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Alpha</CardTitle>
                <CardDescription>
                  A clean and focused project management approach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  This project focuses on delivering exceptional user experiences 
                  through minimalist design principles.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">View Details</Button>
                <Button size="sm">Get Started</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Design System</CardTitle>
                <CardDescription>
                  Consistent and beautiful component library
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Our design system ensures consistency across all products 
                  while maintaining visual harmony.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Learn More</Button>
                <Button size="sm">Explore</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Research</CardTitle>
                <CardDescription>
                  Data-driven insights for better decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Comprehensive user research helps us understand 
                  user needs and create better solutions.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Read Report</Button>
                <Button size="sm">Start Research</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Form Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Form Elements</h2>
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Contact Form</CardTitle>
              <CardDescription>
                Get in touch with us using this clean form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <Textarea placeholder="Enter your message" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Send Message</Button>
            </CardFooter>
          </Card>
        </section>

        {/* Buttons Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Buttons</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <Button>Primary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Dialog Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Modal Dialog</h2>
          <Card>
            <CardContent className="pt-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Welcome to our platform</DialogTitle>
                    <DialogDescription>
                      This is a clean, minimalist dialog that demonstrates 
                      our design principles in action.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Our minimalist approach focuses on clarity, simplicity, 
                      and user experience. Every element serves a purpose.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Continue</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
