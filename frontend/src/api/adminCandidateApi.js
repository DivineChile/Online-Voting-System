const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchPositionsByElection(accessToken, electionId) {
  const response = await fetch(
    `${API_BASE_URL}/admin/positions?election_id=${encodeURIComponent(electionId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch positions.');
  }

  return result;
}

export async function createCandidate(accessToken, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/candidates`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create candidate.');
  }

  return result;
}

export async function updateCandidate(accessToken, candidateId, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/candidates/${candidateId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update candidate.');
  }

  return result;
}

export async function updateCandidateStatus(accessToken, candidateId, isActive) {
  const response = await fetch(`${API_BASE_URL}/admin/candidates/${candidateId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_active: isActive }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update candidate status.');
  }

  return result;
}