import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PencilLine,
  CalendarRange,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  X,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import {
  fetchAdminElections,
  updateElection,
  updateElectionStatus,
} from '../../api/adminElectionApi';

function formatDateTime(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString();
}

function toDateTimeLocal(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (num) => String(num).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

function canEditElection(status) {
  return status === 'draft';
}

function canTransitionToStatus(currentStatus, nextStatus) {
  const allowedTransitions = {
    draft: ['active'],
    active: ['closed'],
    closed: ['published'],
    published: [],
  };

  return allowedTransitions[currentStatus]?.includes(nextStatus) || false;
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
      : BarChart3;

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type] || styles.info}`}>
      <div className="flex items-start gap-2.5">
        <Icon size={16} className="mt-0.5 flex-shrink-0" />
        <div>{children}</div>
      </div>
    </div>
  );
}

function SummaryStrip({ elections, loading }) {
  const total = elections.length;
  const active = elections.filter((election) => election.status === 'active').length;
  const published = elections.filter((election) => election.status === 'published').length;
  const draft = elections.filter((election) => election.status === 'draft').length;

  const items = [
    {
      label: 'Total elections',
      value: loading ? '...' : total,
      highlight: '',
    },
    {
      label: 'Active',
      value: loading ? '...' : active,
      highlight: 'text-[#534AB7]',
    },
    {
      label: 'Published',
      value: loading ? '...' : published,
      highlight: 'text-[#0F6E56]',
    },
    {
      label: 'Draft',
      value: loading ? '...' : draft,
      highlight: '',
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

function ElectionReadView({ election, onEdit, onStatusChange, updatingElectionId }) {
  const statusOptions = ['draft', 'active', 'closed', 'published'];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 break-words">
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

          <p className="mt-3 text-sm leading-relaxed text-gray-500 max-w-3xl">
            {election.description || 'No description provided.'}
          </p>

          {!canEditElection(election.status) ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {election.status === 'published'
                ? 'This election has been published and is now locked from further editing.'
                : election.status === 'closed'
                ? 'This election has been closed and can no longer be structurally edited.'
                : 'This election is currently active and cannot be edited while voting is ongoing.'}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onEdit(election)}
          disabled={!canEditElection(election.status)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            canEditElection(election.status)
              ? 'Edit election'
              : 'Only draft elections can be edited'
          }
        >
          <PencilLine size={15} />
          Edit
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.08em] text-gray-400">
            Start
          </p>
          <p className="mt-1.5 text-sm font-medium text-gray-900">
            {formatDateTime(election.start_time)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.08em] text-gray-400">
            End
          </p>
          <p className="mt-1.5 text-sm font-medium text-gray-900">
            {formatDateTime(election.end_time)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.08em] text-gray-400">
            Published
          </p>
          <p className="mt-1.5 text-sm font-medium text-gray-900">
            {formatDateTime(election.published_at)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-medium text-gray-400 tracking-widest uppercase mb-3">
          Change status
        </p>

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((statusOption) => (
            <button
              key={statusOption}
              type="button"
              onClick={() => onStatusChange(election.id, statusOption)}
              disabled={
                updatingElectionId === election.id ||
                election.status === statusOption ||
                !canTransitionToStatus(election.status, statusOption)
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title={
                canTransitionToStatus(election.status, statusOption)
                  ? `Change status to ${statusOption}`
                  : `Cannot move from ${election.status} to ${statusOption}`
              }
            >
              {updatingElectionId === election.id ? 'Updating...' : statusOption}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ElectionEditView({
  electionId,
  electionForm,
  onChange,
  onSave,
  onCancel,
  savingElectionId,
}) {
  return (
    <div className="rounded-2xl border border-[#D9D6FB] bg-[#F9F8FF] p-6 shadow-sm">
      <div className="flex items-center gap-2 text-[#534AB7]">
        <PencilLine size={16} />
        <p className="text-sm font-medium">Editing election</p>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
            Election title
          </label>
          <input
            type="text"
            name="title"
            value={electionForm.title}
            onChange={onChange}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#534AB7]"
            placeholder="Election title"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            value={electionForm.description}
            onChange={onChange}
            rows="4"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#534AB7]"
            placeholder="Election description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
              Start time
            </label>
            <div className="relative">
              <CalendarRange
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="datetime-local"
                name="start_time"
                value={electionForm.start_time}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 outline-none focus:border-[#534AB7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
              End time
            </label>
            <div className="relative">
              <CalendarRange
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="datetime-local"
                name="end_time"
                value={electionForm.end_time}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 outline-none focus:border-[#534AB7]"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => onSave(electionId)}
            disabled={savingElectionId === electionId}
            className="inline-flex items-center gap-2 rounded-xl bg-[#534AB7] px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_16px_rgba(83,74,183,.24)] hover:bg-[#433a99] disabled:bg-gray-300 disabled:shadow-none transition"
          >
            <Save size={15} />
            {savingElectionId === electionId ? 'Saving...' : 'Save changes'}
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
    </div>
  );
}

export default function ManageElectionsPage() {
  const { session } = useAuth();

  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingElectionId, setUpdatingElectionId] = useState('');
  const [editingElectionId, setEditingElectionId] = useState('');
  const [savingElectionId, setSavingElectionId] = useState('');
  const [electionForm, setElectionForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    async function loadElections() {
      try {
        const result = await fetchAdminElections(session?.access_token);
        setElections(result.data || []);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load elections.');
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadElections();
    }
  }, [session]);

  function startEditingElection(election) {
    setEditingElectionId(election.id);
    setElectionForm({
      title: election.title || '',
      description: election.description || '',
      start_time: toDateTimeLocal(election.start_time),
      end_time: toDateTimeLocal(election.end_time),
    });
    setPageMessage('');
    setErrorMessage('');
  }

  function cancelEditingElection() {
    setEditingElectionId('');
    setElectionForm({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
    });
  }

  function handleElectionFormChange(event) {
    const { name, value } = event.target;

    setElectionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleElectionSave(electionId) {
    setSavingElectionId(electionId);
    setPageMessage('');
    setErrorMessage('');

    try {
      const payload = {
        ...electionForm,
        start_time: new Date(electionForm.start_time).toISOString(),
        end_time: new Date(electionForm.end_time).toISOString(),
      };

      const result = await updateElection(
        session?.access_token,
        electionId,
        payload
      );

      setElections((prev) =>
        prev.map((election) =>
          election.id === electionId ? result.data : election
        )
      );

      setPageMessage(result.message || 'Election updated successfully.');
      cancelEditingElection();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update election.');
    } finally {
      setSavingElectionId('');
    }
  }

  async function handleStatusChange(electionId, nextStatus) {
    setErrorMessage('');
    setPageMessage('');
    setUpdatingElectionId(electionId);

    try {
      const result = await updateElectionStatus(
        session?.access_token,
        electionId,
        nextStatus
      );

      setElections((prev) =>
        prev.map((election) =>
          election.id === electionId ? result.data : election
        )
      );

      setPageMessage(result.message || 'Election status updated successfully.');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update election status.');
    } finally {
      setUpdatingElectionId('');
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              Manage Elections
            </h1>
            <p className="mt-2 text-sm md:text-[15px] leading-relaxed text-gray-500 max-w-3xl">
              Review election records, update timing, and move elections through their lifecycle.
            </p>
          </div>

          <Link
            to="/admin/elections/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#534AB7] px-5 py-3 text-sm font-medium text-white shadow-[0_4px_16px_rgba(83,74,183,.24)] hover:bg-[#433a99] transition"
          >
            <Plus size={16} />
            Create Election
          </Link>
        </div>
      </div>

      <SummaryStrip elections={elections} loading={loading} />

      {errorMessage ? (
        <StatusMessage type="error">{errorMessage}</StatusMessage>
      ) : null}

      {pageMessage ? (
        <StatusMessage type="success">{pageMessage}</StatusMessage>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          Loading elections...
        </div>
      ) : elections.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          No elections found yet.
        </div>
      ) : (
        <div className="space-y-4">
          {elections.map((election) =>
            editingElectionId === election.id ? (
              <ElectionEditView
                key={election.id}
                electionId={election.id}
                electionForm={electionForm}
                onChange={handleElectionFormChange}
                onSave={handleElectionSave}
                onCancel={cancelEditingElection}
                savingElectionId={savingElectionId}
              />
            ) : (
              <ElectionReadView
                key={election.id}
                election={election}
                onEdit={startEditingElection}
                onStatusChange={handleStatusChange}
                updatingElectionId={updatingElectionId}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}