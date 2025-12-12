import React from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className
}) => {
  const variants = {
    success: 'bg-green-500/20 text-green-400 border-green-400/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
    danger: 'bg-red-500/20 text-red-400 border-red-400/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
    default: 'bg-white/10 text-white border-white/20'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }
  
  return (
    <span className={clsx(
      'inline-flex items-center font-semibold rounded-full border',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  )
}