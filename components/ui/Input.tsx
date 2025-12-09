import { InputHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Input 组件 - 遵循设计原则
 * 
 * 交互状态：默认 / 聚焦 / 错误 / 禁用
 * 可访问性：label 关联、错误提示、ARIA 属性
 * 动效：150ms 过渡
 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const widthStyle = fullWidth ? 'w-full' : '';
    const errorStyle = error
      ? 'border-error-500 focus:ring-error-500'
      : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary-500';

    return (
      <div className={`${widthStyle} ${className}`}>
        {/* Label - 可访问性 */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Input 容器 */}
        <div className="relative">
          {/* 左侧图标 */}
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon
                className="w-4 h-4 text-neutral-400 dark:text-neutral-500"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Input 元素 */}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-3 py-2 rounded-lg border bg-white dark:bg-neutral-800 text-foreground
              focus:outline-none focus:ring-2 focus:border-transparent
              transition-all duration-150
              placeholder:text-neutral-400
              disabled:opacity-50 disabled:cursor-not-allowed
              ${Icon ? 'pl-10' : ''}
              ${errorStyle}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
            {...props}
          />
        </div>

        {/* 错误信息 - 可访问性 */}
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-error-600 dark:text-error-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* 辅助文本 */}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
