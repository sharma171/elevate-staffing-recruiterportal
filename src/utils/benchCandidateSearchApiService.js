import { API_CONFIG } from "./apiConfig";

const BENCH_SEARCH_API_URL = "https://fetch-bench-candidates-search-v3-305451280005.us-east1.run.app";

/**
 * Search bench candidates by name, email, job title, or visa status
 * @param searchTerm - Search text, minimum 3 characters. Prefix match.
 * @returns Array of matching candidates
 */
export async function searchBenchCandidates(searchTerm) {
  if (searchTerm.length < 3) {
    return [];
  }

  const response = await fetch(BENCH_SEARCH_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: API_CONFIG.AUTHORIZATION_TOKEN,
      Origin: window.location.origin,
    },
    body: JSON.stringify({
      emailid: "marketing@4spheresolutions.com",
      search_term: searchTerm,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Search failed with status ${response.status}`);
  }

  const data = await response.json();

  // Transform the response from { "id: X": {...} } format to array with id
  const candidates = Object.entries(data).map(([key, value]) => {
    const idMatch = key.match(/id:\s*(\d+)/);
    const id = idMatch ? parseInt(idMatch[1], 10) : 0;
    return {
      id,
      ...value,
    };
  });

  return candidates;
}
