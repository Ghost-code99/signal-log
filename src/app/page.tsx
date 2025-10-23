import { Hero } from '@/components/marketing/hero';
import { Problem } from '@/components/marketing/problem';
import { Solution } from '@/components/marketing/solution';
import { CTA } from '@/components/marketing/cta';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, Lightbulb, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import SupabaseTest from '@/components/supabase-test';

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <Solution />

      {/* Supabase Connection Test */}
      <section className="container mx-auto px-4 py-8">
        <SupabaseTest />
      </section>

      {/* Dashboard CTA */}
      <section className="container mx-auto px-4 py-12">
        <Card className="p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">
              Manage All Your Projects in One Place
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Use the new Multi-Project Dashboard to organize your initiatives,
              track progress, and link ideas, assumptions, and experiments to
              specific projects.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                <BarChart3 className="h-5 w-5" />
                Open Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Four Powerful Tools to Get Started
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            No database required. No complex setup. Just AI-powered intelligence
            to help you think better and move faster.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Feature 1 - NEW */}
          <Card className="p-6 hover:shadow-md transition-shadow duration-200">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <Badge className="mb-2">
                  NEW
                </Badge>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  AI Project Health Scanner
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Get instant AI triage for 3-5 active projects. See status,
                  risks, and next steps for your entire portfolio.
                </p>
              </div>
              <Link href="/project-health-scanner">
                <Button className="w-full">Try It Now</Button>
              </Link>
            </div>
          </Card>

          {/* Feature 2 */}
          <Card className="p-6 hover:shadow-md transition-shadow duration-200">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  Idea Capture & AI Tag Suggester
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Capture scattered thoughts and let AI instantly organize them
                  with intelligent tags. No more idea graveyards.
                </p>
              </div>
              <Link href="/idea-capture">
                <Button className="w-full" variant="outline">
                  Try It Now
                </Button>
              </Link>
            </div>
          </Card>

          {/* Feature 3 */}
          <Card className="p-6 hover:shadow-md transition-shadow duration-200">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Target className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  AI Assumption Challenger
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Get critical questions that challenge your thinking and
                  strengthen ideas before you invest time and resources.
                </p>
              </div>
              <Link href="/assumption-challenger">
                <Button className="w-full" variant="outline">
                  Try It Now
                </Button>
              </Link>
            </div>
          </Card>

          {/* Feature 4 */}
          <Card className="p-6 hover:shadow-md transition-shadow duration-200">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  Quick Experiment Canvas
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Transform vague concepts into structured experiments with
                  clear metrics and next steps in seconds.
                </p>
              </div>
              <Link href="/experiment-canvas">
                <Button className="w-full" variant="outline">
                  Try It Now
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <CTA />
    </>
  );
}
