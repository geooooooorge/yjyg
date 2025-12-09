import { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Button 组件 - 遵循设计原则
 * 
 * 交互状态：默认 / 悬停 / 聚焦 / 激活 / 加载 / 禁用
 * 动效：50-150ms 瞬时反馈
 * 可访问性：ARIA 标签、键盘导航、焦点可见
 */

interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

interface ButtonAsButton extends BaseButtonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  href?: never;
  disabled?: boolean;
}

interface ButtonAsLink extends BaseButtonProps, AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  disabled?: boolean;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

function isLinkButton(props: ButtonProps): props is ButtonAsLink {
  return 'href' in props && props.href !== undefined;
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon: Icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    // 变体样式 (60% 主色 / 30% 辅助色 / 10% 强调色)
    const variantStyles = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow-md',
      secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
      ghost: 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800',
      danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 shadow-sm hover:shadow-md',
    };

    // 尺寸样式 (间距体系: 4/8/16/24)
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    };

    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';
    const disabledStyles = disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
    const widthStyle = fullWidth ? 'w-full' : '';

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${disabledStyles} ${className}`;

    const content = (
      <>
        {/* 加载状态 - 反馈类动效 */}
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* 左侧图标 */}
        {!loading && Icon && iconPosition === 'left' && (
          <Icon className="w-4 h-4" aria-hidden="true" />
        )}

        {children}

        {/* 右侧图标 */}
        {!loading && Icon && iconPosition === 'right' && (
          <Icon className="w-4 h-4" aria-hidden="true" />
        )}
      </>
    );

    if (isLinkButton(props)) {
      const { href, disabled: _, loading: __, variant: ___, size: ____, icon: _____, iconPosition: ______, fullWidth: _______, ...linkProps } = props as ButtonAsLink;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={disabled || loading ? undefined : href}
          className={combinedClassName}
          aria-busy={loading}
          aria-disabled={disabled || loading}
          {...linkProps}
        >
          {content}
        </a>
      );
    }

    const { disabled: _, loading: __, variant: ___, size: ____, icon: _____, iconPosition: ______, fullWidth: _______, ...buttonProps } = props as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={disabled || loading}
        className={combinedClassName}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...buttonProps}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
