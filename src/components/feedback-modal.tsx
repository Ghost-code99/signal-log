'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { submitFeedback } from '@/app/actions/submit-feedback';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Validation schema
const feedbackSchema = z.object({
  description: z.string().min(1, 'Please share your thoughts'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ isOpen, onOpenChange }: FeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
  });

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Get current URL from window (client-side)
      const currentUrl = typeof window !== 'undefined' ? window.location.href : undefined;

      // Call Server Action
      const result = await submitFeedback(data.description, currentUrl);

      if (!result.success) {
        throw new Error(result.error || 'Failed to send feedback');
      }

      // Success!
      setIsSubmitting(false);
      setShowSuccess(true);
      reset();

      // Auto-close after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      console.error('❌ Error submitting feedback:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to send feedback. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setShowSuccess(false);
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {showSuccess ? (
          <div className="py-8 text-center">
            <div className="mb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Thank you for your feedback!
            </h3>
            <p className="text-sm text-muted-foreground">
              We read every submission and appreciate you taking the time to share your thoughts.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Share Your Thoughts</DialogTitle>
              <DialogDescription>
                Report bugs, suggest feature ideas, ask questions—we read every submission
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  className="resize-none"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {error}
                  </p>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-11 sm:h-9 min-h-[44px] sm:min-h-0"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-11 sm:h-9 min-h-[44px] sm:min-h-0"
                >
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Separate trigger component
interface FeedbackTriggerProps {
  className?: string;
  children?: React.ReactNode;
}

export function FeedbackTrigger({ className, children }: FeedbackTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className || 'text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm'}
      >
        {children || 'Give Feedback'}
      </button>
      <FeedbackModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

