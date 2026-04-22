import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Layers3,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import {
  fetchOfficerDashboardSummary,
  fetchOfficerElectionSetup,
} from '../../api/officerApi';

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

function SetupHero({ election }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C0DD97] bg-[#EAF3DE] px-3 py-1 text-[11px] font-medium text-[#3B6D11]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#639922] animate-pulse" />
            Setup under review
          </div>

          <h1 className="mt-4 text-xl md:text-2xl font-semibold text-gray-900">
            {election.title}
          </h1>

          <p className="mt-2 max-w-3xl text-sm md:text-[15px] leading-relaxed text-gray-500">
            {election.description || 'No description provided.'}
          </p>
        </div>

        <div className="rounded-xl border border-[#EEEDFE] bg-[#F7F6FF] px-4 py-3 md:max-w-[260px]">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#6C63C9]">
            Officer note
          </p>
          <p className="mt-1 text-sm text-gray-700">
            You are viewing the current election structure in read-only mode for verification and oversight.
          </p>
        </div>
      </div>
    </div>
  );
}

function SetupStats({ positions }) {
  const totalPositions = positions.length;
  const totalCandidates = positions.reduce(
    (count, position) => count + position.candidates.length,
    0
  );
  const activeCandidates = positions.reduce(
    (count, position) =>
      count + position.candidates.filter((candidate) => candidate.is_active).length,
    0
  );
  const inactiveCandidates = totalCandidates - activeCandidates;

  const items = [
    {
      label: 'Positions',
      value: totalPositions,
      highlight: 'text-[#534AB7]',
    },
    {
      label: 'Total candidates',
      value: totalCandidates,
      highlight: '',
    },
    {
      label: 'Active candidates',
      value: activeCandidates,
      highlight: 'text-[#0F6E56]',
    },
    {
      label: 'Inactive candidates',
      value: inactiveCandidates,
      highlight: inactiveCandidates > 0 ? 'text-[#993C1D]' : '',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl bg-gray-100 px-4 py-3.5">
          <p className="text-[11px] text-gray-500 mb-1.5">{item.label}</p>
          <p className={`text-[20px] font-medium ${item.highlight || 'text-gray-900'}`}>
            {item.value}
          </p>
        </div>
      ))}
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
            {candidate.department || '—'} • {candidate.level || '—'}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${
            candidate.is_active
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {candidate.is_active ? <CheckCircle2 size={12} /> : <Layers3 size={12} />}
          {candidate.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {candidate.manifesto || 'No manifesto provided.'}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500">
        <div>
          <p className="text-[11px] text-gray-400">Matric No</p>
          <p className="mt-1 text-gray-700">{candidate.matric_no || '—'}</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400">Status</p>
          <p className="mt-1 text-gray-700">
            {candidate.is_active ? 'Eligible for ballot' : 'Not on active ballot'}
          </p>
        </div>
      </div>
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

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
            Order: {position.display_order}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
            Max selections: {position.max_selections}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {position.candidates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
            No candidates configured for this position.
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

export default function OfficerSetupReviewPage() {
  const { session } = useAuth();

  const [activeElectionId, setActiveElectionId] = useState('');
  const [setupData, setSetupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadSetup() {
      try {
        const summaryResult = await fetchOfficerDashboardSummary(
          session?.access_token
        );

        const activeElection = summaryResult.data?.active_election;

        if (!activeElection) {
          setSetupData(null);
          return;
        }

        setActiveElectionId(activeElection.id);

        const setupResult = await fetchOfficerElectionSetup(
          session?.access_token,
          activeElection.id
        );

        setSetupData(setupResult.data || null);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load election setup.');
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadSetup();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="max-w-6xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          Loading election setup...
        </div>
      </div>
    );
  }

  if (errorMessage && !setupData) {
    return (
      <div className="max-w-6xl">
        <StatusMessage type="error">{errorMessage}</StatusMessage>
      </div>
    );
  }

  if (!activeElectionId || !setupData) {
    return (
      <div className="max-w-6xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          There is no active election setup to review right now.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <SetupHero election={setupData.election} />

      {errorMessage ? (
        <StatusMessage type="error">{errorMessage}</StatusMessage>
      ) : null}

      <SetupStats positions={setupData.positions || []} />

      <div className="space-y-5">
        {setupData.positions.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
            No positions have been configured for this election yet.
          </div>
        ) : (
          setupData.positions.map((position) => (
            <PositionSection key={position.id} position={position} />
          ))
        )}
      </div>
    </div>
  );
}