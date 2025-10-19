'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { IdeaCapture } from '@/components/idea-capture';

function IdeaCaptureContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || undefined;
  const projectName = searchParams.get('projectName') || undefined;

  return <IdeaCapture projectId={projectId} projectName={projectName} />;
}

export default function IdeaCapturePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3">
          Idea Capture & AI Tag Suggester
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform scattered thoughts into organized, actionable insights with AI-powered tagging
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <IdeaCaptureContent />
      </Suspense>
    </div>
  );
}

