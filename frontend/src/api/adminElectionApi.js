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

export async function createElection(accessToken, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/elections`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create election.');
  }

  return result;
}

export async function updateElection(accessToken, electionId, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/elections/${electionId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update election.');
  }

  return result;
}

export async function updateElectionStatus(accessToken, electionId, status) {
  const response = await fetch(`${API_BASE_URL}/admin/elections/${electionId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update election status.');
  }

  return result;
}