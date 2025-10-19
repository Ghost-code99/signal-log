import { ProjectHealthScanner } from '@/components/project-health-scanner';

export const metadata = {
  title: 'AI Project Health Scanner | Signal Log',
  description:
    'Get instant triage on your active projects. AI analyzes your portfolio and provides status signals, risk flags, and actionable next steps.',
};

export default function ProjectHealthScannerPage() {
  return <ProjectHealthScanner />;
}
