import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  PencilLine,
  Save,
  X,
  Users,
  Layers3,
  ShieldCheck,
  UserCheck,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { fetchAdminElections } from '../../api/adminElectionApi';
import { fetchElectionSetup } from '../../api/adminSetupApi';
import {
  updateCandidate,
  updateCandidateStatus,
} from '../../api/adminCandidateApi';
import { updatePosition } from '../../api/adminPositionManageApi';

function formatDateTime(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString();
}

function canEditElection(status) {
  return status === 'draft';
}

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
            Admin review
          </div>

          <h1 className="mt-4 text-xl md:text-2xl font-semibold text-gray-900">
            Review Election Setup
          </h1>

          <p className="mt-2 max-w-3xl text-sm md:text-[15px] leading-relaxed text-gray-500">
            Inspect positions and candidates for an election, confirm readiness, and make changes where lifecycle rules allow.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/positions/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <Layers3 size={15} />
            Create Position
          </Link>

          <Link
            to="/admin/candidates/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#534AB7] px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_16px_rgba(83,74,183,.24)] hover:bg-[#433a99] transition"
          >
            <UserCheck size={15} />
            Create Candidate
          </Link>
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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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

function SetupSummary({ election, positions }) {
  const totalPositions = positions.length;
  const totalCandidates = positions.reduce(
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
                {election.title}
              </h2>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium capitalize ${getStatusBadgeClass(
                  election.status
                )}`}
              >
                {election.status}
              </span>
            </div>

            <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-gray-500 max-w-3xl">
              {election.description || 'No description provided.'}
            </p>
          </div>

          <div className="rounded-xl border border-[#E6F1FB] bg-[#F5FAFF] px-4 py-3 md:min-w-[220px]">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[#185FA5]">
              Review mode
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {canEditElection(election.status)
                ? 'This election is in draft and can still be updated.'
                : 'This election is locked from structural editing in its current state.'}
            </p>
          </div>
        </div>

        {!canEditElection(election.status) ? (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {election.status === 'published'
              ? 'This election has been published and is now locked from further setup changes.'
              : election.status === 'closed'
              ? 'This election has been closed and can no longer be structurally edited.'
              : 'This election is currently active and cannot be edited while voting is ongoing.'}
          </div>
        ) : null}
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
            {formatDateTime(election.start_time)}
          </p>
        </div>

        <div className="rounded-xl bg-gray-100 px-4 py-3.5">
          <p className="text-[11px] text-gray-500 mb-1.5">End time</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDateTime(election.end_time)}
          </p>
        </div>
      </div>
    </div>
  );
}

function CandidateEditForm({
  candidateForm,
  onChange,
  onSave,
  onCancel,
  saving,
}) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        name="full_name"
        value={candidateForm.full_name}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#534AB7]"
        placeholder="Full name"
      />

      <input
        type="text"
        name="matric_no"
        value={candidateForm.matric_no}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#534AB7]"
        placeholder="Matric number"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          name="department"
          value={candidateForm.department}
          onChange={onChange}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#534AB7]"
          placeholder="Department"
        />

        <input
          type="text"
          name="level"
          value={candidateForm.level}
          onChange={onChange}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#534AB7]"
          placeholder="Level"
        />
      </div>

      <textarea
        name="manifesto"
        value={candidateForm.manifesto}
        onChange={onChange}
        rows="3"
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#534AB7]"
        placeholder="Manifesto"
      />

      <input
        type="text"
        name="image_url"
        value={candidateForm.image_url}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#534AB7]"
        placeholder="Image URL"
      />

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#534AB7] px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_16px_rgba(83,74,183,.24)] hover:bg-[#433a99] disabled:bg-gray-300 disabled:shadow-none transition"
        >
          <Save size={15} />
          {saving ? 'Saving...' : 'Save'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <X size={15} />
          Cancel
        </button>
      </div>
    </div>
  );
}

function PositionEditForm({
  positionForm,
  onChange,
  onSave,
  onCancel,
  saving,
}) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        name="title"
        value={positionForm.title}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#534AB7]"
        placeholder="Position title"
      />

      <textarea
        name="description"
        value={positionForm.description}
        onChange={onChange}
        rows="3"
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#534AB7]"
        placeholder="Description"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="number"
          min="1"
          name="display_order"
          value={positionForm.display_order}
          onChange={onChange}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#534AB7]"
          placeholder="Display order"
        />

        <input
          type="number"
          min="1"
          name="max_selections"
          value={positionForm.max_selections}
          onChange={onChange}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#534AB7]"
          placeholder="Max selections"
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#534AB7] px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_16px_rgba(83,74,183,.24)] hover:bg-[#433a99] disabled:bg-gray-300 disabled:shadow-none transition"
        >
          <Save size={15} />
          {saving ? 'Saving position...' : 'Save Position'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <X size={15} />
          Cancel
        </button>
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  isEditing,
  canEdit,
  candidateForm,
  onStartEdit,
  onChange,
  onSave,
  onCancel,
  onToggleStatus,
  saving,
  statusUpdating,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300">
      {!isEditing ? (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-gray-900">
                {candidate.full_name}
              </p>
              <p className="mt-1 text-[12px] text-gray-500">
                {candidate.department || 'No department'} • {candidate.level || 'No level'}
              </p>
            </div>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${
                candidate.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {candidate.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            {candidate.manifesto || 'No manifesto provided.'}
          </p>

          <div className="mt-4 text-xs text-gray-500">
            Matric No: {candidate.matric_no || '—'}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onStartEdit(candidate)}
              disabled={!canEdit}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title={canEdit ? 'Edit candidate' : 'Only draft elections can be edited'}
            >
              <PencilLine size={13} />
              Edit
            </button>

            <button
              type="button"
              onClick={() => onToggleStatus(candidate.id, !candidate.is_active)}
              disabled={!canEdit || statusUpdating}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title={canEdit ? 'Toggle candidate status' : 'Only draft elections can be edited'}
            >
              {statusUpdating
                ? 'Updating...'
                : candidate.is_active
                ? 'Deactivate'
                : 'Activate'}
            </button>
          </div>
        </>
      ) : (
        <CandidateEditForm
          candidateForm={candidateForm}
          onChange={onChange}
          onSave={onSave}
          onCancel={onCancel}
          saving={saving}
        />
      )}
    </div>
  );
}

function PositionSection({
  position,
  isEditingPosition,
  canEdit,
  positionForm,
  onStartEditPosition,
  onPositionFormChange,
  onPositionSave,
  onCancelPosition,
  savingPosition,
  editingCandidateId,
  candidateForm,
  onStartEditCandidate,
  onCandidateFormChange,
  onCandidateSave,
  onCancelCandidate,
  onCandidateStatusToggle,
  savingCandidateId,
  statusUpdatingCandidateId,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
      {!isEditingPosition ? (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {position.title}
                </h3>
              </div>

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
              <button
                type="button"
                onClick={() => onStartEditPosition(position)}
                disabled={!canEdit}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title={canEdit ? 'Edit position' : 'Only draft elections can be edited'}
              >
                <PencilLine size={13} />
                Edit Position
              </button>
            </div>
          </div>
        </>
      ) : (
        <PositionEditForm
          positionForm={positionForm}
          onChange={onPositionFormChange}
          onSave={onPositionSave}
          onCancel={onCancelPosition}
          saving={savingPosition}
        />
      )}

      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Users size={15} className="text-gray-500" />
          <h4 className="text-sm font-semibold text-gray-700">Candidates</h4>
        </div>

        {position.candidates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
            No candidates added for this position yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {position.candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isEditing={editingCandidateId === candidate.id}
                canEdit={canEdit}
                candidateForm={candidateForm}
                onStartEdit={onStartEditCandidate}
                onChange={onCandidateFormChange}
                onSave={() => onCandidateSave(candidate.id)}
                onCancel={onCancelCandidate}
                onToggleStatus={onCandidateStatusToggle}
                saving={savingCandidateId === candidate.id}
                statusUpdating={statusUpdatingCandidateId === candidate.id}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function ReviewElectionSetupPage() {
  const { session } = useAuth();

  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [setupData, setSetupData] = useState(null);

  const [loadingElections, setLoadingElections] = useState(true);
  const [loadingSetup, setLoadingSetup] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [pageMessage, setPageMessage] = useState('');

  const [editingCandidateId, setEditingCandidateId] = useState('');
  const [savingCandidateId, setSavingCandidateId] = useState('');
  const [statusUpdatingCandidateId, setStatusUpdatingCandidateId] = useState('');
  const [candidateForm, setCandidateForm] = useState({
    full_name: '',
    matric_no: '',
    department: '',
    level: '',
    manifesto: '',
    image_url: '',
  });

  const [editingPositionId, setEditingPositionId] = useState('');
  const [savingPositionId, setSavingPositionId] = useState('');
  const [positionForm, setPositionForm] = useState({
    title: '',
    description: '',
    display_order: 1,
    max_selections: 1,
  });

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
    async function loadSetup() {
      if (!selectedElectionId) {
        setSetupData(null);
        return;
      }

      setLoadingSetup(true);
      setErrorMessage('');
      setPageMessage('');
      setEditingCandidateId('');
      setEditingPositionId('');

      try {
        const result = await fetchElectionSetup(
          session?.access_token,
          selectedElectionId
        );
        setSetupData(result.data);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load election setup.');
        setSetupData(null);
      } finally {
        setLoadingSetup(false);
      }
    }

    if (session?.access_token) {
      loadSetup();
    }
  }, [session, selectedElectionId]);

  const canEdit = useMemo(
    () => canEditElection(setupData?.election?.status),
    [setupData]
  );

  function startEditingPosition(position) {
    setEditingPositionId(position.id);
    setPositionForm({
      title: position.title || '',
      description: position.description || '',
      display_order: position.display_order || 1,
      max_selections: position.max_selections || 1,
    });
    setPageMessage('');
    setErrorMessage('');
  }

  function cancelEditingPosition() {
    setEditingPositionId('');
    setPositionForm({
      title: '',
      description: '',
      display_order: 1,
      max_selections: 1,
    });
  }

  function handlePositionFormChange(event) {
    const { name, value } = event.target;

    setPositionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handlePositionSave(positionId) {
    setSavingPositionId(positionId);
    setPageMessage('');
    setErrorMessage('');

    try {
      const result = await updatePosition(session?.access_token, positionId, {
        ...positionForm,
        display_order: Number(positionForm.display_order),
        max_selections: Number(positionForm.max_selections),
      });

      setSetupData((prev) => ({
        ...prev,
        positions: prev.positions
          .map((position) =>
            position.id === positionId
              ? { ...result.data, candidates: position.candidates }
              : position
          )
          .sort((a, b) => a.display_order - b.display_order),
      }));

      setPageMessage(result.message || 'Position updated successfully.');
      cancelEditingPosition();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update position.');
    } finally {
      setSavingPositionId('');
    }
  }

  function startEditingCandidate(candidate) {
    setEditingCandidateId(candidate.id);
    setCandidateForm({
      full_name: candidate.full_name || '',
      matric_no: candidate.matric_no || '',
      department: candidate.department || '',
      level: candidate.level || '',
      manifesto: candidate.manifesto || '',
      image_url: candidate.image_url || '',
    });
    setErrorMessage('');
    setPageMessage('');
  }

  function cancelEditingCandidate() {
    setEditingCandidateId('');
    setCandidateForm({
      full_name: '',
      matric_no: '',
      department: '',
      level: '',
      manifesto: '',
      image_url: '',
    });
  }

  function handleCandidateFormChange(event) {
    const { name, value } = event.target;

    setCandidateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleCandidateSave(candidateId) {
    setSavingCandidateId(candidateId);
    setErrorMessage('');
    setPageMessage('');

    try {
      const result = await updateCandidate(
        session?.access_token,
        candidateId,
        candidateForm
      );

      setSetupData((prev) => ({
        ...prev,
        positions: prev.positions.map((position) => ({
          ...position,
          candidates: position.candidates.map((candidate) =>
            candidate.id === candidateId ? result.data : candidate
          ),
        })),
      }));

      setPageMessage(result.message || 'Candidate updated successfully.');
      cancelEditingCandidate();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update candidate.');
    } finally {
      setSavingCandidateId('');
    }
  }

  async function handleCandidateStatusToggle(candidateId, nextStatus) {
    setStatusUpdatingCandidateId(candidateId);
    setErrorMessage('');
    setPageMessage('');

    try {
      const result = await updateCandidateStatus(
        session?.access_token,
        candidateId,
        nextStatus
      );

      setSetupData((prev) => ({
        ...prev,
        positions: prev.positions.map((position) => ({
          ...position,
          candidates: position.candidates.map((candidate) =>
            candidate.id === candidateId ? result.data : candidate
          ),
        })),
      }));

      setPageMessage(result.message || 'Candidate status updated successfully.');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update candidate status.');
    } finally {
      setStatusUpdatingCandidateId('');
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <PageHero />

      {errorMessage ? (
        <StatusMessage type="error">{errorMessage}</StatusMessage>
      ) : null}

      {pageMessage ? (
        <StatusMessage type="success">{pageMessage}</StatusMessage>
      ) : null}

      <ElectionPicker
        elections={elections}
        selectedElectionId={selectedElectionId}
        onChange={setSelectedElectionId}
        loadingElections={loadingElections}
      />

      {loadingSetup ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          Loading election setup...
        </div>
      ) : null}

      {!loadingSetup && setupData ? (
        <>
          <SetupSummary
            election={setupData.election}
            positions={setupData.positions || []}
          />

          <div className="space-y-5">
            {setupData.positions.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
                No positions have been added to this election yet.
              </div>
            ) : (
              setupData.positions.map((position) => (
                <PositionSection
                  key={position.id}
                  position={position}
                  isEditingPosition={editingPositionId === position.id}
                  canEdit={canEdit}
                  positionForm={positionForm}
                  onStartEditPosition={startEditingPosition}
                  onPositionFormChange={handlePositionFormChange}
                  onPositionSave={() => handlePositionSave(position.id)}
                  onCancelPosition={cancelEditingPosition}
                  savingPosition={savingPositionId === position.id}
                  editingCandidateId={editingCandidateId}
                  candidateForm={candidateForm}
                  onStartEditCandidate={startEditingCandidate}
                  onCandidateFormChange={handleCandidateFormChange}
                  onCandidateSave={handleCandidateSave}
                  onCancelCandidate={cancelEditingCandidate}
                  onCandidateStatusToggle={handleCandidateStatusToggle}
                  savingCandidateId={savingCandidateId}
                  statusUpdatingCandidateId={statusUpdatingCandidateId}
                />
              ))
            )}
          </div>
        </>
      ) : null}

      {!loadingSetup && selectedElectionId && !setupData ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          No setup data was found for this election.
        </div>
      ) : null}
    </div>
  );
}