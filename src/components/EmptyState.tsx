import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="tf-card rounded-2xl px-6 py-12 flex flex-col items-center justify-center text-center">
      {/* Light monochromatic illustration with #DBEAFE and #2563EB lines */}
      <svg
        width="88"
        height="88"
        viewBox="0 0 88 88"
        fill="none"
        aria-hidden="true"
        className="mb-5"
      >
        <circle cx="44" cy="44" r="40" fill="#EFF6FF" />
        <rect
          x="22"
          y="24"
          width="44"
          height="40"
          rx="8"
          fill="#FFFFFF"
          stroke="#DBEAFE"
          strokeWidth="2"
        />
        <rect x="29" y="33" width="10" height="10" rx="3" fill="#DBEAFE" />
        <path
          d="M31.5 38L33.5 40L37 36"
          stroke="#2563EB"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="44"
          y1="38"
          x2="58"
          y2="38"
          stroke="#2563EB"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect
          x="29"
          y="49"
          width="10"
          height="10"
          rx="3"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />
        <line
          x1="44"
          y1="54"
          x2="55"
          y2="54"
          stroke="#CBD5E1"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <h3 className="text-[18px] leading-[26px] font-semibold text-[#0F172A]">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-[20px] text-[#64748B] max-w-sm">{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-[14px] font-semibold transition-all tf-btn-primary"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
