const OWNER = "CStaks";
const REPOSITORY = "Typist";
const API_URL = `https://api.github.com/repos/${OWNER}/${REPOSITORY}/commits/HEAD`;

export async function hasNewerCommit(currentHash: string): Promise<boolean> {
  if (!currentHash) return false;
  const response = await fetch(API_URL, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  const latest = (await response.json()) as { sha?: string };
  return Boolean(latest.sha && !latest.sha.startsWith(currentHash) && !currentHash.startsWith(latest.sha));
}

export const releasesUrl = `https://github.com/${OWNER}/${REPOSITORY}/releases`;
