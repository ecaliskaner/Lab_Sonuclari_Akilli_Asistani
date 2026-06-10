import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLabResultDetail } from '../hooks/useLabResults';
import { ResultDetailCard } from '../components/lab/ResultDetailCard';
import { LlmAnalysisPanel } from '../components/llm/LlmAnalysisPanel';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import { ArrowLeft } from 'lucide-react';

export const ResultDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const resultId = id ? parseInt(id, 10) : NaN;

  const { data: result, isLoading, isError, refetch } = useLabResultDetail(resultId);

  return (
    <div className="space-y-6">
      
      {/* Back to list trigger */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Bulgular Listesine Dön</span>
        </Link>
      </div>

      {isLoading && (
        <div className="py-24">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {isError && (
        <ErrorBanner
          message="Seçilen laboratuvar sonucu detayı yüklenemedi. Belirtilen kayıt silinmiş olabilir veya sunucu erişilebilir değil."
          onRetry={() => refetch()}
        />
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Detail Info (2/3 width on large screens) */}
          <div className="lg:col-span-2">
            <ResultDetailCard result={result} />
          </div>

          {/* AI Analysis and clinician actions (1/3 width) */}
          <div className="lg:col-span-1">
            <LlmAnalysisPanel resultId={result.id} />
          </div>
        </div>
      )}
    </div>
  );
};
