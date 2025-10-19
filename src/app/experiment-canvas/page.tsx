'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ExperimentCanvas } from '@/components/experiment-canvas';

function ExperimentCanvasContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || undefined;
  const projectName = searchParams.get('projectName') || undefined;

  return <ExperimentCanvas projectId={projectId} projectName={projectName} />;
}

export default function ExperimentCanvasPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3">
          Quick Experiment Canvas Generator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform vague ideas into structured, actionable experiments with clear success metrics and next steps
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ExperimentCanvasContent />
      </Suspense>
    </div>
  );
}




