const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchOfficerDashboardSummary(accessToken) {
  const response = await fetch(`${API_BASE_URL}/officer/dashboard-summary`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to load officer dashboard.');
  }

  return result;
}

export async function fetchOfficerActiveElection(accessToken) {
  const response = await fetch(`${API_BASE_URL}/officer/election/active`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to load active election.');
  }

  return result;
}

export async function fetchOfficerElectionSetup(accessToken, electionId) {
  const response = await fetch(
    `${API_BASE_URL}/officer/elections/${electionId}/setup`,
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
    throw new Error(result.message || 'Failed to load election setup.');
  }

  return result;
}

export async function fetchOfficerPublishedResults(accessToken) {
  const response = await fetch(`${API_BASE_URL}/officer/results`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to load published results.');
  }

  return result;
}