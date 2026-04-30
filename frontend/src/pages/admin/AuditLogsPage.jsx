import { useEffect, useMemo, useState } from 'react';
import {
  ScrollText,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Activity,
  Database,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { fetchAuditLogs } from '../../api/auditLogApi';

function formatDateTime(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString();
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

function PageHero() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D9D6FB] bg-[#F7F6FF] px-3 py-1 text-[11px] font-medium text-[#534AB7]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#534AB7]" />
            Admin audit
          </div>

          <h1 className="mt-4 text-xl md:text-2xl font-semibold text-gray-900">
            Audit Logs
          </h1>

          <p className="mt-2 max-w-3xl text-sm md:text-[15px] leading-relaxed text-gray-500">
            Review important system actions and activity history across elections, users, setup changes, and ballot events.
          </p>
        </div>

        <div className="rounded-xl border border-[#E6F1FB] bg-[#F5FAFF] px-4 py-3 md:max-w-[250px]">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#185FA5]">
            Integrity note
          </p>
          <p className="mt-1 text-sm text-gray-700">
            Audit entries help preserve accountability and make administrative actions easier to trace.
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryStrip({ logs, loading }) {
  const summary = useMemo(() => {
    const total = logs.length;
    const uniqueActions = new Set(logs.map((log) => log.action).filter(Boolean)).size;
    const entityLogs = logs.filter((log) => log.entity_type).length;
    const recent = logs.slice(0, 10).length;

    return {
      total,
      uniqueActions,
      entityLogs,
      recent,
    };
  }, [logs]);

  const items = [
    {
      label: 'Total logs',
      value: loading ? '...' : summary.total,
      highlight: '',
    },
    {
      label: 'Action types',
      value: loading ? '...' : summary.uniqueActions,
      highlight: 'text-[#534AB7]',
    },
    {
      label: 'Entity-linked logs',
      value: loading ? '...' : summary.entityLogs,
      highlight: '',
    },
    {
      label: 'Recent entries shown',
      value: loading ? '...' : summary.recent,
      highlight: 'text-[#0F6E56]',
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

function getActionTone(action) {
  if (!action) {
    return 'bg-gray-100 text-gray-600';
  }

  if (
    action.includes('create') ||
    action.includes('activate') ||
    action.includes('publish')
  ) {
    return 'bg-green-100 text-green-700';
  }

  if (
    action.includes('update') ||
    action.includes('submit')
  ) {
    return 'bg-[#EEEDFE] text-[#3C3489]';
  }

  if (
    action.includes('deactivate') ||
    action.includes('close')
  ) {
    return 'bg-amber-100 text-amber-700';
  }

  return 'bg-gray-100 text-gray-600';
}

function LogCard({ log }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${getActionTone(
                log.action
              )}`}
            >
              {log.action || 'unknown_action'}
            </span>

            {log.entity_type ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
                <Database size={11} />
                {log.entity_type}
              </span>
            ) : null}
          </div>

          <p className="mt-3 text-sm font-medium text-gray-900">
            {log.description || 'No description provided.'}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 lg:min-w-[200px]">
          <div className="flex items-center gap-2 text-gray-700">
            <Clock3 size={14} />
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
              Logged at
            </p>
          </div>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {formatDateTime(log.created_at)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-[11px] text-gray-400">Entity type</p>
          <p className="mt-1 text-sm text-gray-800">
            {log.entity_type || '—'}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-[11px] text-gray-400">Entity ID</p>
          <p className="mt-1 text-sm text-gray-800 break-all">
            {log.entity_id || '—'}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-[11px] text-gray-400">Actor ID</p>
          <p className="mt-1 text-sm text-gray-800 break-all">
            {log.actor_id || '—'}
          </p>
        </div>
      </div>

      {log.metadata ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-[#FAFBFC] px-4 py-3">
          <div className="flex items-center gap-2 mb-2 text-gray-700">
            <Activity size={14} />
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
              Metadata
            </p>
          </div>

          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-700">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

export default function AuditLogsPage() {
  const { session } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        const result = await fetchAuditLogs(session?.access_token);
        setLogs(result.data || []);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadLogs();
    }
  }, [session]);

  return (
    <div className="max-w-6xl space-y-6">
      <PageHero />

      {errorMessage ? (
        <StatusMessage type="error">{errorMessage}</StatusMessage>
      ) : null}

      <SummaryStrip logs={logs} loading={loading} />

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          Loading audit logs...
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          No audit logs found.
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <LogCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}