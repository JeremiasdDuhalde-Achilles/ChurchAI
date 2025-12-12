// src/components/members/MemberAIInsights.tsx
import React from 'react'
import { Sparkles, TrendingUp, AlertTriangle, Target, Award } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { EmptyState } from '../common/EmptyState'
import type { AIInsights } from '../../types/member'
import { getRiskBadgeVariant, getCommitmentColor } from '../../lib/utils'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend
} from 'recharts'

interface MemberAIInsightsProps {
  insights?: AIInsights
  isLoading: boolean
}

export const MemberAIInsights: React.FC<MemberAIInsightsProps> = ({ insights, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <LoadingSpinner text="Analizando con IA..." size="lg" />
      </Card>
    )
  }

  if (!insights) {
    return (
      <Card>
        <EmptyState
          icon={Sparkles}
          title="Sin datos de IA"
          description="No hay información de análisis de IA disponible para este miembro"
        />
      </Card>
    )
  }

  const { risk_analysis, insights: insightsText, ministry_suggestions } = insights

  // Datos para gráficos
  const commitmentData = [
    {
      name: 'Compromiso',
      value: insights.commitment_score,
      fill: insights.commitment_score >= 80 ? '#10b981' : 
            insights.commitment_score >= 60 ? '#3b82f6' :
            insights.commitment_score >= 40 ? '#f59e0b' : '#ef4444'
    }
  ]

  const attendanceData = [
    {
      name: 'Asistencia',
      value: insights.attendance_rate,
      fill: insights.attendance_rate >= 70 ? '#10b981' :
            insights.attendance_rate >= 50 ? '#f59e0b' : '#ef4444'
    }
  ]

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Commitment Score */}
        <Card variant="gradient">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className={`h-8 w-8 ${getCommitmentColor(insights.commitment_score)}`} />
            <Badge variant={
              insights.commitment_score >= 80 ? 'success' :
              insights.commitment_score >= 60 ? 'info' :
              insights.commitment_score >= 40 ? 'warning' : 'danger'
            }>
              {insights.commitment_score >= 80 ? 'Excelente' :
               insights.commitment_score >= 60 ? 'Bueno' :
               insights.commitment_score >= 40 ? 'Regular' : 'Bajo'}
            </Badge>
          </div>
          <div className={`text-4xl font-bold mb-2 ${getCommitmentColor(insights.commitment_score)}`}>
            {insights.commitment_score.toFixed(0)}
          </div>
          <div className="text-blue-200 text-sm">Score de Compromiso</div>
        </Card>

        {/* Attendance Rate */}
        <Card variant="gradient">
          <div className="flex items-center justify-between mb-4">
            <Target className="h-8 w-8 text-blue-400" />
            <Badge variant={
              insights.attendance_rate >= 70 ? 'success' :
              insights.attendance_rate >= 50 ? 'warning' : 'danger'
            }>
              {insights.attendance_rate >= 70 ? 'Alta' :
               insights.attendance_rate >= 50 ? 'Media' : 'Baja'}
            </Badge>
          </div>
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {insights.attendance_rate.toFixed(0)}%
          </div>
          <div className="text-blue-200 text-sm">Tasa de Asistencia</div>
        </Card>

        {/* Risk Level */}
        <Card variant="gradient">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className={`h-8 w-8 ${
              risk_analysis.level === 'critico' ? 'text-red-400' :
              risk_analysis.level === 'alto' ? 'text-orange-400' :
              risk_analysis.level === 'medio' ? 'text-yellow-400' : 'text-green-400'
            }`} />
            <Badge variant={getRiskBadgeVariant(risk_analysis.level)}>
              {risk_analysis.level.toUpperCase()}
            </Badge>
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            {risk_analysis.score}
          </div>
          <div className="text-blue-200 text-sm">Score de Riesgo</div>
        </Card>

        {/* Ministry Suggestions */}
        <Card variant="gradient">
          <div className="flex items-center justify-between mb-4">
            <Award className="h-8 w-8 text-purple-400" />
            <Badge variant="info">
              {ministry_suggestions.length} sugerencias
            </Badge>
          </div>
          <div className="text-4xl font-bold text-purple-400 mb-2">
            {ministry_suggestions.length}
          </div>
          <div className="text-blue-200 text-sm">Ministerios Sugeridos</div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Commitment Chart */}
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">Análisis de Compromiso</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                data={commitmentData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-3xl font-bold fill-white"
                >
                  {insights.commitment_score.toFixed(0)}
                </text>
                <text
                  x="50%"
                  y="60%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm fill-blue-200"
                >
                  Compromiso
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Attendance Chart */}
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">Tasa de Asistencia</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-3xl font-bold fill-white"
                >
                  {insights.attendance_rate.toFixed(0)}%
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Risk Analysis */}
      <Card variant="solid">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-orange-400" />
          <h3 className="text-xl font-bold text-white">Análisis de Riesgo</h3>
          <Badge variant={getRiskBadgeVariant(risk_analysis.level)}>
            {risk_analysis.level.toUpperCase()}
          </Badge>
        </div>
        
        <p className="text-blue-100 mb-4">{risk_analysis.recommendation}</p>

        {risk_analysis.factors.length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-3">Factores de Riesgo:</h4>
            <div className="space-y-2">
              {risk_analysis.factors.map((factor, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="h-2 w-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                  <span className="text-blue-200 text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* AI Insights Text */}
      <Card variant="gradient">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="h-6 w-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Análisis IA</h3>
        </div>
        <p className="text-blue-100 text-lg leading-relaxed">{insightsText}</p>
      </Card>

      {/* Ministry Suggestions */}
      {ministry_suggestions.length > 0 && (
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <Award className="h-6 w-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Ministerios Sugeridos</h3>
          </div>

          <div className="space-y-4">
            {ministry_suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold capitalize">
                    {suggestion.ministry.replace('_', ' ')}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="text-blue-400 font-bold">{suggestion.fit_score}</div>
                    <div className="text-blue-300 text-sm">/ 100</div>
                  </div>
                </div>
                <p className="text-blue-200 text-sm">{suggestion.reason}</p>
                
                {/* Progress Bar */}
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                    style={{ width: `${suggestion.fit_score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}