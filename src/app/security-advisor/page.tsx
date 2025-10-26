import { SecurityAdvisor } from '@/components/security-advisor'

export const metadata = {
  title: 'Security Advisor | Signal Log',
  description: 'Comprehensive security scan and recommendations for your Supabase database'
}

export default function SecurityAdvisorPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <SecurityAdvisor />
    </div>
  )
}
