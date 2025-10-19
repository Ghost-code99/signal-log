'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AssumptionChallenger } from '@/components/assumption-challenger';

function AssumptionChallengerContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || undefined;
  const projectName = searchParams.get('projectName') || undefined;

  return <AssumptionChallenger projectId={projectId} projectName={projectName} />;
}

export default function AssumptionChallengerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3">
          AI Assumption Challenger
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get critical questions that challenge your thinking and strengthen your ideas before you invest time and resources
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <AssumptionChallengerContent />
      </Suspense>
    </div>
  );
}

