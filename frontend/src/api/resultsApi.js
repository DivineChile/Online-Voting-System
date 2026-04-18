const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchAdminElectionResults(accessToken, electionId) {
  const response = await fetch(
    `${API_BASE_URL}/admin/elections/${electionId}/results`,
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
    throw new Error(result.message || 'Failed to load election results.');
  }

  return result;
}

export async function fetchStudentPublishedResults(accessToken) {
  const response = await fetch(`${API_BASE_URL}/student/results`, {
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