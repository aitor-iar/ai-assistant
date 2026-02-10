import { ButtonHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'primary';
  label?: string;
}

export function IconButton({
  icon: Icon,
  size = 'md',
  variant = 'default',
  label,
  className = '',
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const variantClasses = {
    default: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800',
    ghost: 'text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300',
    primary: 'text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20',
  };

  return (
    <button
      className={`rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      aria-label={label}
      {...props}
    >
      <Icon size={iconSizes[size]} />
    </button>
  );
}
