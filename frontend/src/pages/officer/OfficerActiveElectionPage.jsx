import { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { fetchOfficerActiveElection } from '../../api/officerApi';

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

function ElectionHero({ election }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C0DD97] bg-[#EAF3DE] px-3 py-1 text-[11px] font-medium text-[#3B6D11]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#639922] animate-pulse" />
            Election active
          </div>

          <h1 className="mt-4 text-xl md:text-2xl font-semibold text-gray-900">
            {election.title}
          </h1>

          <p className="mt-2 max-w-3xl text-sm md:text-[15px] leading-relaxed text-gray-500">
            {election.description || 'No description provided.'}
          </p>
        </div>

        <div className="rounded-xl border border-[#EEEDFE] bg-[#F7F6FF] px-4 py-3 md:max-w-[240px]">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#6C63C9]">
            Read-only access
          </p>
          <p className="mt-1 text-sm text-gray-700">
            You can monitor candidate participation but cannot modify election data.
          </p>
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ candidate }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:bg-gray-50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-gray-900">
            {candidate.full_name}
          </p>
          <p className="mt-1 text-[12px] text-gray-500">
            {candidate.department || 'No department'} • {candidate.level || 'No level'}
          </p>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-[11px] font-medium text-green-700">
          <CheckCircle2 size={12} />
          Active
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {candidate.manifesto || 'No manifesto provided.'}
      </p>
    </div>
  );
}

function PositionSection({ position }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{position.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            {position.description || 'No description provided.'}
          </p>
        </div>

        <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
          {position.candidates.length} candidate{position.candidates.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {position.candidates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
            No active candidates available for this position.
          </div>
        ) : (
          position.candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))
        )}
      </div>
    </section>
  );
}

export default function OfficerActiveElectionPage() {
  const { session } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadActiveElection() {
      try {
        const result = await fetchOfficerActiveElection(session?.access_token);
        setData(result.data || null);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load active election.');
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadActiveElection();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          Loading active election...
        </div>
      </div>
    );
  }

  if (errorMessage && !data) {
    return (
      <div className="max-w-5xl">
        <StatusMessage type="error">{errorMessage}</StatusMessage>
      </div>
    );
  }

  if (!data?.election) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          There is no active election available right now.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <ElectionHero election={data.election} />

      {errorMessage ? (
        <StatusMessage type="error">{errorMessage}</StatusMessage>
      ) : null}

      <div className="space-y-5">
        {data.positions.map((position) => (
          <PositionSection key={position.id} position={position} />
        ))}
      </div>
    </div>
  );
}