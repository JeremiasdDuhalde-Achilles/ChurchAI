import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'gradient' | 'solid'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  variant = 'default',
  padding = 'lg'
}) => {
  const variants = {
    default: 'bg-white/10 border border-white/20',
    glass: 'bg-white/10 backdrop-blur-lg border border-white/20',
    gradient: 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/20',
    solid: 'bg-slate-800/80 border border-white/10'
  }
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  return (
    <div className={clsx(
      'rounded-3xl',
      variants[variant],
      paddings[padding],
      className
    )}>
      {children}
    </div>
  )
}