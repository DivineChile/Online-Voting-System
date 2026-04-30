import { useEffect, useState } from 'react';
import {
  Trophy,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Vote,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { fetchAdminElections } from '../../api/adminElectionApi';
import { fetchAdminElectionResults } from '../../api/resultsApi';

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

function getStatusBadgeClass(status) {
  switch (status) {
    case 'active':
      return 'bg-[#EEEDFE] text-[#3C3489] border border-[#D9D6FB]';
    case 'closed':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'published':
      return 'bg-green-50 text-green-700 border border-green-200';
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-200';
  }
}

function PageHero() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D9D6FB] bg-[#F7F6FF] px-3 py-1 text-[11px] font-medium text-[#534AB7]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#534AB7]" />
            Admin analytics
          </div>

          <h1 className="mt-4 text-xl md:text-2xl font-semibold text-gray-900">
            Election Results
          </h1>

          <p className="mt-2 max-w-3xl text-sm md:text-[15px] leading-relaxed text-gray-500">
            Review computed vote totals, compare candidates by position, and confirm winners for each election.
          </p>
        </div>

        <div className="rounded-xl border border-[#E6F1FB] bg-[#F5FAFF] px-4 py-3 md:max-w-[250px]">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#185FA5]">
            Results note
          </p>
          <p className="mt-1 text-sm text-gray-700">
            These results are computed from submitted ballots and should be published only when officially approved.
          </p>
        </div>
      </div>
    </div>
  );
}

function ElectionPicker({
  elections,
  selectedElectionId,
  onChange,
  loadingElections,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm w-full">
      <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
        Select election
      </label>
      <select
        value={selectedElectionId}
        onChange={(event) => onChange(event.target.value)}
        disabled={loadingElections}
        className="w-full md:max-w-xl rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#534AB7]"
      >
        <option value="">
          {loadingElections ? 'Loading elections...' : 'Choose an election'}
        </option>
        {elections.map((election) => (
          <option key={election.id} value={election.id}>
            {election.title} ({election.status})
          </option>
        ))}
      </select>
    </div>
  );
}

function ResultsSummary({ resultsData }) {
  const totalPositions = resultsData.positions.length;
  const totalCandidates = resultsData.positions.reduce(
    (count, position) => count + position.candidates.length,
    0
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {resultsData.election.title}
              </h2>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium capitalize ${getStatusBadgeClass(
                  resultsData.election.status
                )}`}
              >
                {resultsData.election.status}
              </span>
            </div>

            <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-gray-500 max-w-3xl">
              {resultsData.election.description || 'No description provided.'}
            </p>
          </div>

          <div className="rounded-xl border border-[#E6F1FB] bg-[#F5FAFF] px-4 py-3 md:min-w-[220px]">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[#185FA5]">
              Total ballots
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {resultsData.total_ballots}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="rounded-xl bg-gray-100 px-4 py-3.5">
          <p className="text-[11px] text-gray-500 mb-1.5">Positions</p>
          <p className="text-[20px] font-medium text-[#534AB7]">
            {totalPositions}
          </p>
        </div>

        <div className="rounded-xl bg-gray-100 px-4 py-3.5">
          <p className="text-[11px] text-gray-500 mb-1.5">Candidates</p>
          <p className="text-[20px] font-medium text-gray-900">
            {totalCandidates}
          </p>
        </div>

        <div className="rounded-xl bg-gray-100 px-4 py-3.5">
          <p className="text-[11px] text-gray-500 mb-1.5">Start time</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(resultsData.election.start_time).toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl bg-gray-100 px-4 py-3.5">
          <p className="text-[11px] text-gray-500 mb-1.5">End time</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(resultsData.election.end_time).toLocaleString()}
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
        <div className="min-w-0">
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

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500">
        <div>
          <p className="text-[11px] text-gray-400">Votes</p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {candidate.votes}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400">Matric No</p>
          <p className="mt-1 text-sm text-gray-700">
            {candidate.matric_no || '—'}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Relative lead</span>
          <span>{percentage}%</span>
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
  const topVotes =
    position.candidates.length > 0 ? position.candidates[0].votes : 0;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {position.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            {position.description || 'Computed vote totals for this position.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
            <Users size={12} />
            {position.candidates.length} candidate
            {position.candidates.length !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
            <Vote size={12} />
            Top vote: {topVotes}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {position.candidates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
            No candidates available for this position.
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

export default function AdminResultsPage() {
  const { session } = useAuth();

  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [resultsData, setResultsData] = useState(null);
  const [loadingElections, setLoadingElections] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadElections() {
      try {
        const result = await fetchAdminElections(session?.access_token);
        setElections(result.data || []);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load elections.');
      } finally {
        setLoadingElections(false);
      }
    }

    if (session?.access_token) {
      loadElections();
    }
  }, [session]);

  useEffect(() => {
    async function loadResults() {
      if (!selectedElectionId) {
        setResultsData(null);
        return;
      }

      setLoadingResults(true);
      setErrorMessage('');

      try {
        const result = await fetchAdminElectionResults(
          session?.access_token,
          selectedElectionId
        );
        setResultsData(result.data);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load election results.');
        setResultsData(null);
      } finally {
        setLoadingResults(false);
      }
    }

    if (session?.access_token) {
      loadResults();
    }
  }, [session, selectedElectionId]);

  return (
    <div className="max-w-6xl space-y-6">
      <PageHero />

      {errorMessage ? (
        <StatusMessage type="error">{errorMessage}</StatusMessage>
      ) : null}

      <ElectionPicker
        elections={elections}
        selectedElectionId={selectedElectionId}
        onChange={setSelectedElectionId}
        loadingElections={loadingElections}
      />

      {loadingResults ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          Loading results...
        </div>
      ) : null}

      {!loadingResults && resultsData ? (
        <>
          <ResultsSummary resultsData={resultsData} />

          <div className="space-y-5">
            {resultsData.positions.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
                No result positions were found for this election.
              </div>
            ) : (
              resultsData.positions.map((position) => (
                <PositionResultsSection key={position.id} position={position} />
              ))
            )}
          </div>
        </>
      ) : null}

      {!loadingResults && selectedElectionId && !resultsData ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          No result data was found for this election.
        </div>
      ) : null}
    </div>
  );
}