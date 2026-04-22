import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Vote,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import {
  fetchActiveElectionForStudent,
  submitStudentBallot,
} from '../../api/studentVotingApi';

function StatusMessage({ type = 'info', children }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-green-200 bg-green-50 text-green-700',
    info: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  const Icon =
    type === 'error'
      ? AlertCircle
      : type === 'success'
      ? CheckCircle2
      : ShieldCheck;

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
            Voting open
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
            Ballot rule
          </p>
          <p className="mt-1 text-sm text-gray-700">
            Select one candidate for each position and submit your ballot once.
          </p>
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ candidate, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${
        isSelected
          ? 'border-[#534AB7] bg-[#F7F6FF] shadow-sm ring-1 ring-[#534AB7]/10'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-gray-900">
            {candidate.full_name}
          </p>
          <p className="mt-1 text-[12px] text-gray-500">
            {candidate.department || 'No department'} • {candidate.level || 'No level'}
          </p>
        </div>

        <div
          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border transition ${
            isSelected
              ? 'border-[#534AB7] bg-[#534AB7] text-white'
              : 'border-gray-300 bg-white text-transparent group-hover:border-gray-400'
          }`}
        >
          <Check size={12} />
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {candidate.manifesto || 'No manifesto provided.'}
      </p>
    </button>
  );
}

function PositionSection({ position, selectedCandidateId, onSelectCandidate }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{position.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            {position.description || 'Select one candidate for this position.'}
          </p>
        </div>

        <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
          One selection
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {position.candidates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
            No candidates available for this position.
          </div>
        ) : (
          position.candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidateId === candidate.id}
              onSelect={() => onSelectCandidate(position.id, candidate.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function ProgressPanel({
  totalPositions,
  answeredPositions,
  allPositionsAnswered,
  submitting,
  onSubmit,
}) {
  const completion =
    totalPositions > 0 ? (answeredPositions / totalPositions) * 100 : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md">
          <p className="text-sm font-medium text-gray-900">Ballot completion</p>
          <p className="mt-1 text-sm text-gray-500">
            {answeredPositions} of {totalPositions} positions selected
          </p>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[#534AB7] transition-all duration-300"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 md:items-end">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allPositionsAnswered || submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#534AB7] px-5 py-3 text-sm font-medium text-white shadow-[0_4px_16px_rgba(83,74,183,.24)] transition hover:bg-[#433a99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            <Vote size={15} />
            {submitting ? 'Submitting ballot...' : 'Submit Ballot'}
          </button>

          {!allPositionsAnswered ? (
            <p className="text-xs text-gray-500">
              Complete all positions before submitting.
            </p>
          ) : (
            <p className="text-xs text-green-700">
              Your ballot is ready to submit.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function AlreadyVotedState() {
  return (
    <div className="rounded-2xl border border-green-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-700">
          <CheckCircle2 size={24} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            You have already voted
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Your ballot has already been recorded successfully for this election.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StudentVotingPage() {
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [electionData, setElectionData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [pageMessage, setPageMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState({});

  useEffect(() => {
    async function loadVotingPage() {
      try {
        const result = await fetchActiveElectionForStudent(session?.access_token);
        setElectionData(result.data || null);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load active election.');
        setElectionData(null);
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadVotingPage();
    }
  }, [session]);

  const totalPositions = electionData?.positions?.length || 0;
  const answeredPositions = Object.keys(selectedCandidates).length;

  const allPositionsAnswered = useMemo(() => {
    if (!electionData?.positions?.length) return false;

    return electionData.positions.every(
      (position) => selectedCandidates[position.id]
    );
  }, [electionData, selectedCandidates]);

  function handleCandidateSelect(positionId, candidateId) {
    setSelectedCandidates((prev) => ({
      ...prev,
      [positionId]: candidateId,
    }));
  }

  async function handleSubmitBallot() {
    if (!electionData?.election?.id) return;

    setSubmitting(true);
    setErrorMessage('');
    setPageMessage('');

    try {
      const selections = Object.entries(selectedCandidates).map(
        ([position_id, candidate_id]) => ({
          position_id,
          candidate_id,
        })
      );

      const result = await submitStudentBallot(session?.access_token, {
        election_id: electionData.election.id,
        selections,
      });

      setPageMessage(result.message || 'Ballot submitted successfully.');
      setElectionData((prev) => ({
        ...prev,
        has_voted: true,
      }));
    } catch (error) {
      setErrorMessage(error.message || 'Failed to submit ballot.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          Loading voting page...
        </div>
      </div>
    );
  }

  if (errorMessage && !electionData) {
    return (
      <div className="max-w-5xl">
        <StatusMessage type="error">{errorMessage}</StatusMessage>
      </div>
    );
  }

  if (!electionData?.election) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          No active election is available.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <ElectionHero election={electionData.election} />

      {errorMessage ? (
        <StatusMessage type="error">{errorMessage}</StatusMessage>
      ) : null}

      {pageMessage ? (
        <StatusMessage type="success">{pageMessage}</StatusMessage>
      ) : null}

      {electionData.has_voted ? (
        <AlreadyVotedState />
      ) : (
        <>
          <div className="space-y-5">
            {electionData.positions.map((position) => (
              <PositionSection
                key={position.id}
                position={position}
                selectedCandidateId={selectedCandidates[position.id]}
                onSelectCandidate={handleCandidateSelect}
              />
            ))}
          </div>

          <ProgressPanel
            totalPositions={totalPositions}
            answeredPositions={answeredPositions}
            allPositionsAnswered={allPositionsAnswered}
            submitting={submitting}
            onSubmit={handleSubmitBallot}
          />
        </>
      )}
    </div>
  );
}