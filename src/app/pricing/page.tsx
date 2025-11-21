'use client';

import { PricingTable } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Shield, Zap, Clock } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <Badge className="mb-4" variant="outline">
            Simple, Transparent Pricing
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Transform from Reactive Juggler to{' '}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Strategic Portfolio Manager
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Save 10-20 hours/month on strategic thinking. See conflicts, synergies, and priorities across all your initiatives.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section id="pricing" className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <PricingTable for="user" />
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Why Founders Choose Us
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Time</h3>
              <p className="text-sm text-muted-foreground">
                Saves 10-20 hours/month on strategic thinking. Pays for itself in 2-5 hours.
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Portfolio Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                See conflicts, synergies, and priorities across all your initiatives. Unique AI-powered insights.
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Avoid Wasted Runway</h3>
              <p className="text-sm text-muted-foreground">
                Prevent wasted runway on wrong bets. Faster path to product-market fit.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Compare Plans
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Starter</th>
                  <th className="text-center p-4 font-semibold bg-primary/5">
                    Professional ⭐
                  </th>
                  <th className="text-center p-4 font-semibold">Strategic</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">Active Projects</td>
                  <td className="text-center p-4">Up to 5</td>
                  <td className="text-center p-4 bg-primary/5">Unlimited</td>
                  <td className="text-center p-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">AI Health Scanner</td>
                  <td className="text-center p-4">Weekly</td>
                  <td className="text-center p-4 bg-primary/5">Real-time</td>
                  <td className="text-center p-4">Real-time</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Cross-Project Analysis</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4 bg-primary/5">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Assumption Challenger</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4 bg-primary/5">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Experiment Canvas</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4 bg-primary/5">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Portfolio Analytics</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4 bg-primary/5">❌</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">API Access</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4 bg-primary/5">❌</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr>
                  <td className="p-4">Support</td>
                  <td className="text-center p-4">Email</td>
                  <td className="text-center p-4 bg-primary/5">Priority</td>
                  <td className="text-center p-4">Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Trusted by Solo Founders
          </h2>
          
          <div className="grid sm:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">10x</div>
              <p className="text-sm text-muted-foreground">ROI - Customer gets 10x value</p>
            </Card>
            
            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">10-20</div>
              <p className="text-sm text-muted-foreground">Hours saved per month</p>
            </Card>
            
            <Card className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">2-5</div>
              <p className="text-sm text-muted-foreground">Hours to pay for itself</p>
            </Card>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 pt-8">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-5 w-5 text-primary" />
              <span>Secure payments via Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-5 w-5 text-primary" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-5 w-5 text-primary" />
              <span>14-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">
                How does the free trial work?
              </h3>
              <p className="text-sm text-muted-foreground">
                Start with a 14-day free trial on the Professional plan. No credit card required. 
                Cancel anytime during the trial with no charges.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">
                Can I change plans later?
              </h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and billing is prorated.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">
                What if I need more than 5 projects?
              </h3>
              <p className="text-sm text-muted-foreground">
                Upgrade to Professional for unlimited projects. You'll also unlock portfolio-level AI 
                intelligence and all advanced features.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">
                How is this different from other project management tools?
              </h3>
              <p className="text-sm text-muted-foreground">
                Other tools help you track projects. We help you think strategically about your portfolio. 
                Our AI identifies conflicts, synergies, and priorities across all your initiatives—something 
                no other tool does.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">
                What happens if I cancel?
              </h3>
              <p className="text-sm text-muted-foreground">
                You can cancel anytime. Your subscription will remain active until the end of your billing 
                period, then access will be revoked.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-sm text-muted-foreground">
                Yes, we offer a 14-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <Card className="p-8 sm:p-12 text-center max-w-3xl mx-auto bg-gradient-to-br from-primary/10 to-accent/10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your Portfolio Management?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="flex justify-center">
            <a href="#pricing">
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                View Pricing Plans
              </button>
            </a>
          </div>
        </Card>
      </section>
    </div>
  );
}

