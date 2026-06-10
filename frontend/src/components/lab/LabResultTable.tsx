import React from 'react';
import type { LabResultSummary } from '../../types/labResult';
import { LabResultRow } from './LabResultRow';
import { Inbox } from 'lucide-react';

interface LabResultTableProps {
  results: LabResultSummary[];
}

export const LabResultTable: React.FC<LabResultTableProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center rounded-[24px] border-dashed border-2 border-slate-200 bg-white px-4 py-16 text-center">
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <Inbox className="h-6 w-6 text-slate-450" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Sonuç Bulunamadı</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Belirtilen filtrelere uygun laboratuvar testi kaydı bulunmamaktadır.
        </p>
      </div>
    );
  }
 
  return (
    <div className="glass-panel overflow-x-auto rounded-[24px] bg-white border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              Hasta Ref
            </th>
            <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              Test Adı
            </th>
            <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              Değer
            </th>
            <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              Referans Aralığı
            </th>
            <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              Durum
            </th>
            <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              Alınma Zamanı
            </th>
            <th scope="col" className="relative px-6 py-3.5">
              <span className="sr-only">Eylem</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {results.map((result) => (
            <LabResultRow key={result.id} result={result} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
