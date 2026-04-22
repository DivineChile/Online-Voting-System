import { useEffect, useState } from 'react';
import { Trophy, BarChart3, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { fetchStudentPublishedResults } from '../../api/resultsApi';

function StatusMessage({ type = 'info', children }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  const Icon = type === 'error' ? AlertCircle : ShieldCheck;

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type] || styles.info}`}>
      <div className="flex items-start gap-2.5">
        <Icon size={16} className="mt-0.5 flex-shrink-0" />
        <div>{children}</div>
      </div>
    </div>
  );
}

function ResultsHero({ election, totalBallots }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C0DD97] bg-[#EAF3DE] px-3 py-1 text-[11px] font-medium text-[#3B6D11]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#639922]" />
            Published results
          </div>

          <h1 className="mt-4 text-xl md:text-2xl font-semibold text-gray-900">
            {election.title}
          </h1>

          <p className="mt-2 text-sm md:text-[15px] leading-relaxed text-gray-500 max-w-3xl">
            {election.description || 'Official election outcome summary.'}
          </p>
        </div>

        <div className="rounded-xl border border-[#E6F1FB] bg-[#F5FAFF] px-4 py-3 md:min-w-[180px]">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#185FA5]">
            Total ballots
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {totalBallots}
          </p>
        </div>
      </div>
    </div>
  );
}

function CandidateResultCard({ candidate, isWinner, topVotes }) {
  const percentage =
    topVotes > 0 ? Math.round((candidate.votes / topVotes) * 100) : 0;

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        isWinner
          ? 'border-green-200 bg-green-50/60'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-medium text-gray-900">
            {candidate.full_name}
          </p>
          <p className="mt-1 text-[12px] text-gray-500">
            {candidate.department || '—'} • {candidate.level || '—'}
          </p>
        </div>

        {isWinner ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-[11px] font-medium text-green-700">
            <Trophy size={12} />
            Winner
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Votes</span>
          <span className="font-medium text-gray-900">
            {candidate.votes}
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isWinner ? 'bg-green-500' : 'bg-[#534AB7]'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function PositionResultsSection({ position }) {
  const topVotes = position.candidates.length > 0 ? position.candidates[0].votes : 0;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{position.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            {position.description || 'Published vote count for this position.'}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
          <BarChart3 size={12} />
          {position.candidates.length} candidate{position.candidates.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {position.candidates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
            No result data available for this position.
          </div>
        ) : (
          position.candidates.map((candidate) => {
            const isWinner = position.winners.some(
              (winner) => winner.id === candidate.id
            );

            return (
              <CandidateResultCard
                key={candidate.id}
                candidate={candidate}
                isWinner={isWinner}
                topVotes={topVotes}
              />
            );
          })
        )}
      </div>
    </section>
  );
}

export default function StudentResultsPage() {
  const { session } = useAuth();

  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadResults() {
      try {
        const result = await fetchStudentPublishedResults(session?.access_token);
        setResultsData(result.data || null);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load published results.');
        setResultsData(null);
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadResults();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          Loading published results...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-5xl">
        <StatusMessage type="error">{errorMessage}</StatusMessage>
      </div>
    );
  }

  if (!resultsData) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          No published results are available yet.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <ResultsHero
        election={resultsData.election}
        totalBallots={resultsData.total_ballots}
      />

      <div className="space-y-5">
        {resultsData.positions.map((position) => (
          <PositionResultsSection key={position.id} position={position} />
        ))}
      </div>
    </div>
  );
}