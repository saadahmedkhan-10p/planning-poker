export interface FetchedStory {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  source: 'ado' | 'jira';
}

export async function fetchStoryFromUrl(url: string, token: string): Promise<FetchedStory> {
  const envServerUrl = (import.meta as any).env?.VITE_SERVER_URL;
  const baseUrl = envServerUrl || (window.location.port === '5173' ? 'http://localhost:4000' : window.location.origin);
  const targetUrl = `${baseUrl}/api/fetch-story?url=${encodeURIComponent(url.trim())}`;

  const headers: Record<string, string> = {};
  if (token && token.trim()) {
    headers['X-Story-Token'] = token.trim();
  }

  const response = await fetch(targetUrl, { headers });
  if (!response.ok) {
    let errMessage = response.statusText;
    try {
      const errJson = await response.json();
      if (errJson?.error) errMessage = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errMessage || `Failed to fetch story (${response.status})`);
  }

  return response.json();
}
