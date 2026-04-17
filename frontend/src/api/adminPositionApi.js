const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchAdminElections(accessToken) {
  const response = await fetch(`${API_BASE_URL}/admin/elections`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch elections.');
  }

  return result;
}

export async function createPosition(accessToken, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/positions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create position.');
  }

  return result;
}