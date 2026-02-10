import { User, Bot } from 'lucide-react';

interface AvatarProps {
  role: 'user' | 'assistant';
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ role, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const isUser = role === 'user';

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
        isUser
          ? 'bg-primary-500 dark:bg-primary-600 text-white'
          : 'bg-accent-500 dark:bg-accent-600 text-white'
      }`}
    >
      {isUser ? (
        <User size={iconSizes[size]} />
      ) : (
        <Bot size={iconSizes[size]} />
      )}
    </div>
  );
}
