'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';

interface UpgradePromptProps {
  /**
   * Name of the feature that requires upgrade
   */
  featureName: string;
  /**
   * Custom message to display
   */
  upgradeMessage?: string;
  /**
   * Required plan name (if specific plan is needed)
   */
  requiredPlan?: 'starter' | 'professional' | 'strategic';
}

/**
 * UpgradePrompt Component
 * 
 * Displays an upgrade prompt when a user tries to access a premium feature
 * they don't have access to. Links to the pricing page.
 * 
 * @example
 * ```tsx
 * <UpgradePrompt 
 *   featureName="Unlimited Projects"
 *   upgradeMessage="Upgrade to unlock unlimited projects"
 *   requiredPlan="professional"
 * />
 * ```
 */
export function UpgradePrompt({
  featureName,
  upgradeMessage,
  requiredPlan,
}: UpgradePromptProps) {
  const planDisplayName = requiredPlan
    ? requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)
    : 'a subscription';

  const defaultMessage = upgradeMessage || `This feature requires ${planDisplayName} plan.`;

  return (
    <Card className="p-8 border-2 border-dashed">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="rounded-full bg-primary/10 p-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">Premium Feature</h3>
          <p className="text-muted-foreground max-w-md">
            {defaultMessage}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>
            <strong>{featureName}</strong> is available with {planDisplayName} plan
          </span>
        </div>

        <div className="pt-4">
          <Link href="/pricing">
            <Button size="lg" className="gap-2">
              View Pricing Plans
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="pt-2">
          <Badge variant="outline" className="text-xs">
            14-day free trial • Cancel anytime
          </Badge>
        </div>
      </div>
    </Card>
  );
}

