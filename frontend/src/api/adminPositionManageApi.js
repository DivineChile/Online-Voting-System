const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function updatePosition(accessToken, positionId, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/positions/${positionId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update position.');
  }

  return result;
}