'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  ExternalLink,
  Download,
  XCircle
} from 'lucide-react'

interface SecurityFinding {
  id: string
  title: string
  description: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  category: string
  recommendation: string
  referenceUrl?: string
  resolved: boolean
}

interface SecurityScore {
  overallScore: number
  categories: Record<string, number>
  totalFindings: number
  criticalFindings: number
  highFindings: number
  mediumFindings: number
  lowFindings: number
  lastUpdated?: Date | string // Optional: last scan timestamp
}

const SEVERITY_COLORS = {
  critical: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  info: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
}

export function SecurityAdvisor() {
  const [findings, setFindings] = useState<SecurityFinding[]>([])
  const [score, setScore] = useState<SecurityScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)

  const fetchSecurityData = async () => {
    try {
      const response = await fetch('/api/security-advisor')
      const data = await response.json()
      
      if (data.success && data.data) {
        setFindings(data.data.findings)
        setScore(data.data.score)
      }
    } catch (error) {
      console.error('Error fetching security data:', error)
    } finally {
      setLoading(false)
      setScanning(false)
    }
  }

  const runScan = async () => {
    setScanning(true)
    try {
      const response = await fetch('/api/security-advisor?action=scan')
      const data = await response.json()
      
      if (data.success) {
        setFindings(data.findings)
        // Refresh the score as well
        const scoreResponse = await fetch('/api/security-advisor?action=score')
        const scoreData = await scoreResponse.json()
        if (scoreData.success) {
          setScore(scoreData.score)
        }
      }
    } catch (error) {
      console.error('Error running scan:', error)
    } finally {
      setScanning(false)
    }
  }

  const resolveFinding = async (findingId: string) => {
    try {
      const response = await fetch('/api/security-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve', findingId })
      })
      
      const data = await response.json()
      if (data.success) {
        // Update the finding in state
        setFindings(prev => prev.map(f => 
          f.id === findingId ? { ...f, resolved: true } : f
        ))
      }
    } catch (error) {
      console.error('Error resolving finding:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  useEffect(() => {
    fetchSecurityData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100" />
      </div>
    )
  }

  const unresolvedFindings = findings.filter(f => !f.resolved)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Advisor
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive security scan and recommendations
          </p>
        </div>
        <Button
          onClick={runScan}
          disabled={scanning}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scanning...' : 'Run Scan'}
        </Button>
      </div>

      {/* Security Score */}
      {score && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Overall Security Score</h3>
                {score.lastUpdated && (
                  <Badge variant="outline">
                    Last scan: {new Date(score.lastUpdated).toLocaleString()}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-6xl font-bold ${getScoreColor(score.overallScore)}`}>
                  {score.overallScore}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>Total Findings: {score.totalFindings}</div>
                  <div>Unresolved: {unresolvedFindings.length}</div>
                </div>
              </div>
            </div>

            {/* Category Scores */}
            {Object.entries(score.categories).map(([category, categoryScore]) => (
              <div key={category} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium capitalize">{category}</span>
                  <span className={`text-lg font-bold ${getScoreColor(categoryScore)}`}>
                    {categoryScore}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      categoryScore >= 80 ? 'bg-green-500' :
                      categoryScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${categoryScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Findings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-2xl font-bold">{score?.criticalFindings || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Critical</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-2xl font-bold">{score?.highFindings || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">High</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold">{score?.mediumFindings || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Medium</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{score?.lowFindings || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Low</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Findings List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Security Findings</h3>
          
          {unresolvedFindings.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No unresolved security issues found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {unresolvedFindings.map((finding) => (
                <div
                  key={finding.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={SEVERITY_COLORS[finding.severity]}>
                          {finding.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {finding.category}
                        </Badge>
                      </div>
                      <h4 className="font-semibold mb-1">{finding.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {finding.description}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Recommendation:</strong> {finding.recommendation}
                      </p>
                      {finding.referenceUrl && (
                        <a
                          href={finding.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1 mt-2"
                        >
                          Learn more <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveFinding(finding.id)}
                      className="shrink-0"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>About Security Advisor:</strong> The Security Advisor scans your Supabase 
            database for common security vulnerabilities and provides specific recommendations. 
            Access the full Security Advisor in your Supabase dashboard under Security settings.
          </div>
        </div>
      </Card>
    </div>
  )
}
