const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchActiveElectionForStudent(accessToken) {
  const response = await fetch(`${API_BASE_URL}/student/election/active`, {
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

export async function submitStudentBallot(accessToken, payload) {
  const response = await fetch(`${API_BASE_URL}/student/ballots`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to submit ballot.');
  }

  return result;
}