import { useEffect, useState } from 'react';
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

function AuditLogsPage() {
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl bg-white shadow-md p-8">
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="mt-2 text-slate-600">
            Review important system actions and activity history.
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="rounded-2xl bg-white shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-sm text-slate-600">Loading audit logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-sm text-slate-600">No audit logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Action
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Entity Type
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Entity ID
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Description
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {log.entity_type || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {log.entity_id || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {log.description || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDateTime(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditLogsPage;