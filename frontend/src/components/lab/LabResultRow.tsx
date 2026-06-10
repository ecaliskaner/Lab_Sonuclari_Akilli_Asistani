import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { LabResultSummary } from '../../types/labResult';
import { AbnormalityBadge } from './AbnormalityBadge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';

interface LabResultRowProps {
  result: LabResultSummary;
}

export const LabResultRow: React.FC<LabResultRowProps> = ({ result }) => {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/results/${result.id}`);
  };

  const formattedDate = () => {
    try {
      return format(new Date(result.collectedAt), 'dd MMM yyyy HH:mm', { locale: tr });
    } catch {
      return result.collectedAt;
    }
  };

  return (
    <tr
      onClick={handleRowClick}
      className="group cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50/70"
    >
      <td className="whitespace-nowrap px-6 py-4.5 text-sm font-semibold text-slate-600">
        {result.patientRef}
      </td>
      <td className="whitespace-nowrap px-6 py-4.5 text-sm">
        <div className="font-bold text-slate-800">{result.testName}</div>
        <div className="text-xs font-semibold text-slate-400">{result.testCode}</div>
      </td>
      <td className="whitespace-nowrap px-6 py-4.5 text-sm font-bold text-slate-800">
        {result.value} <span className="text-xs font-normal text-slate-550">{result.unit}</span>
      </td>
      <td className="whitespace-nowrap px-6 py-4.5 text-sm font-semibold text-slate-500">
        {result.referenceMin} - {result.referenceMax} <span className="text-xs">{result.unit}</span>
      </td>
      <td className="whitespace-nowrap px-6 py-4.5">
        <AbnormalityBadge severity={result.severity} />
      </td>
      <td className="whitespace-nowrap px-6 py-4.5 text-sm text-slate-500">
        {formattedDate()}
      </td>
      <td className="whitespace-nowrap px-6 py-4.5 text-right text-sm font-medium">
        <span className="flex w-full items-center justify-end gap-0.5 text-yeka-blue transition group-hover:text-yeka-blue-hover">
          <span>İncele</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </td>
    </tr>
  );
};
