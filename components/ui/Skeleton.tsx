import { HTMLAttributes, forwardRef } from 'react';

/**
 * Skeleton 组件 - 遵循设计原则
 * 
 * 性能策略：骨架屏优于 loading spinner
 * 动效：脉冲动画提供反馈
 */

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      text: 'rounded h-4',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    };

    const inlineStyles = {
      ...style,
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    };

    return (
      <div
        ref={ref}
        className={`skeleton bg-neutral-200 dark:bg-neutral-700 ${variantStyles[variant]} ${className}`}
        style={inlineStyles}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * StockCardSkeleton - 股票卡片骨架屏
 */
export const StockCardSkeleton = () => {
  return (
    <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
      {/* AI 评分区域 */}
      <div className="mb-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
        <div className="flex items-start gap-2">
          <Skeleton variant="circular" width={20} height={20} />
          <div className="flex-1 space-y-2">
            <Skeleton width="100%" />
            <Skeleton width="80%" />
          </div>
        </div>
      </div>

      {/* 股票信息 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton width={80} />
            <Skeleton width={60} />
          </div>
          <Skeleton width={60} />
        </div>

        <div className="space-y-1.5">
          <Skeleton width="70%" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        </div>
      </div>
    </div>
  );
};
