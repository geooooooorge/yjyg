import { HTMLAttributes, forwardRef } from 'react';

/**
 * Card 组件 - 遵循设计原则
 * 
 * 视觉层级：阴影、边框、圆角
 * 交互状态：默认 / 悬停
 * 动效：250ms 过渡
 */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, padding = 'md', className = '', ...props }, ref) => {
    // 间距体系: 4/8/16/24
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4 sm:p-6',
      lg: 'p-6 sm:p-8',
    };

    const baseStyles = 'bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 transition-shadow duration-250';
    const hoverStyles = hover ? 'hover:shadow-lg cursor-pointer' : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * CardHeader 组件
 */
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, icon, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between gap-4 mb-4 ${className}`}
        {...props}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {icon && (
            <div className="flex-shrink-0 mt-1" aria-hidden="true">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * CardContent 组件
 */
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';
