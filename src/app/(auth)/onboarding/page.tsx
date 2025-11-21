'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { completeOnboarding } from './actions';
import { 
  LayoutDashboard, 
  Sparkles, 
  Rocket,
  ChevronLeft,
  X
} from 'lucide-react';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleComplete = async () => {
    setIsCompleting(true);
    setError(null);
    try {
      // Step 1: Update metadata via server action
      const result = await completeOnboarding();

      if (result?.error) {
        console.error('Onboarding completion error:', result.error);
        setError(result.error);
        setIsCompleting(false);
        return;
      }

      // Step 2: Force JWT refresh (CRITICAL!)
      // skipCache: true forces Clerk to fetch a fresh token from server
      await getToken({ skipCache: true });

      // Step 3: Hard redirect to ensure middleware sees fresh JWT
      // Use window.location.href, NOT Next.js router.push()
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError('Something went wrong. Please try again.');
      setIsCompleting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const screens = [
    {
      step: 1,
      icon: LayoutDashboard,
      headline: 'Welcome to Signal Log',
      subheading: 'Your strategic command center for managing multiple project initiatives',
      description: 'See all your projects, experiments, and initiatives in one place. Track your journey from concept to product-market fit with a unified view.',
      showBack: false,
    },
    {
      step: 2,
      icon: Sparkles,
      headline: 'Your AI Strategy Partner',
      subheading: 'Get portfolio-level intelligence: identify conflicts, synergies, and priorities',
      description: 'The AI analyzes your entire portfolio, not just individual projects. Get insights that help you make smarter decisions about where to focus your energy.',
      tip: 'The AI analyzes your entire portfolio, not just individual projects',
      showBack: true,
    },
    {
      step: 3,
      icon: Rocket,
      headline: 'Ready to Get Started?',
      subheading: 'Create your first project to see the dashboard in action',
      description: 'Transform scattered ideas into validated experiments. Start by creating your first project and watch the AI help you think strategically.',
      showBack: true,
    },
  ];

  const currentScreen = screens[currentStep - 1];
  const Icon = currentScreen.icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl">
        <Card className="border-muted/40 bg-card/50 backdrop-blur shadow-xl relative">
          <CardContent className="p-8 md:p-12">
            {/* Skip Button */}
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleComplete}
                disabled={isCompleting}
                className="text-muted-foreground hover:text-foreground h-10 sm:h-8 min-w-[44px] sm:min-w-0"
              >
                <X className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Skip</span>
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8 flex items-center justify-center gap-2">
              {screens.map((screen) => (
                <div
                  key={screen.step}
                  className={`h-2 w-2 rounded-full transition-all ${
                    screen.step <= currentStep
                      ? 'bg-primary w-8'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <div className="text-center mb-2 text-sm text-muted-foreground">
              {currentStep} of 3
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive text-center">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="mt-2 w-full text-xs h-11 sm:h-8 min-h-[44px] sm:min-h-0"
                >
                  Dismiss
                </Button>
              </div>
            )}

            {/* Screen Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-6"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                </div>

                {/* Headline */}
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {currentScreen.headline}
                </h1>

                {/* Subheading */}
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
                  {currentScreen.subheading}
                </p>

                {/* Description */}
                <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  {currentScreen.description}
                </p>

                {/* Tip Box (Screen 2 only) */}
                {currentStep === 2 && currentScreen.tip && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-muted">
                    <p className="text-sm text-muted-foreground">
                      💡 {currentScreen.tip}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-12 flex items-center justify-between gap-4">
              <div className="flex-1">
                {currentScreen.showBack && (
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={isCompleting}
                    className="gap-2 h-11 sm:h-9 min-h-[44px] sm:min-h-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                {currentStep < 3 ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={handleComplete}
                      disabled={isCompleting}
                      className="text-muted-foreground h-11 sm:h-9 min-h-[44px] sm:min-h-0"
                    >
                      Skip
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={isCompleting}
                      size="lg"
                      className="min-w-[120px] h-11 sm:h-10 min-h-[44px] sm:min-h-0"
                    >
                      Next
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      disabled={isCompleting}
                      className="gap-2 h-11 sm:h-9 min-h-[44px] sm:min-h-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleComplete}
                      disabled={isCompleting}
                      size="lg"
                      className="min-w-[120px] h-11 sm:h-10 min-h-[44px] sm:min-h-0"
                    >
                      {isCompleting ? 'Loading...' : 'Get Started'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

