const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchAuditLogs(accessToken) {
  const response = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to load audit logs.');
  }

  return result;
}