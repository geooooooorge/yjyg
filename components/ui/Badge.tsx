import { HTMLAttributes, forwardRef } from 'react';

/**
 * Badge 组件 - 遵循设计原则
 * 
 * 视觉层级：颜色、尺寸
 * 语义化：成功/警告/错误/信息
 */

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', size = 'md', className = '', ...props }, ref) => {
    // 变体样式 - 语义化颜色
    const variantStyles = {
      default: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
      success: 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400',
      warning: 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400',
      error: 'bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-400',
      info: 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400',
    };

    // 尺寸样式
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
