import React from 'react';

interface AbnormalityBadgeProps {
  severity: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH';
}

export const AbnormalityBadge: React.FC<AbnormalityBadgeProps> = ({ severity }) => {
  const styles = {
    NORMAL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    LOW: 'bg-amber-50 text-amber-700 border-amber-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    CRITICAL_LOW: 'bg-rose-50 text-rose-700 border-rose-200',
    CRITICAL_HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const labels = {
    NORMAL: 'Normal',
    LOW: 'Düşük',
    HIGH: 'Yüksek',
    CRITICAL_LOW: 'Kritik Düşük',
    CRITICAL_HIGH: 'Kritik Yüksek',
  };

  const isCritical = severity?.startsWith('CRITICAL');

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${
        styles[severity] || styles.NORMAL
      }`}
    >
      {isCritical && (
        <span className="relative flex h-2 w-2">
          {/* Animated ping ring, hidden if prefers-reduced-motion is active */}
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 motion-reduce:hidden"></span>
          {/* Center core dot */}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
      )}
      {labels[severity] || severity}
    </span>
  );
};
