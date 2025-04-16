// src/components/GitHubStats.tsx
import { useEffect, useState } from 'react';

interface GitHubStatsProps {
  username: string;
}

export default function GitHubStats({ username }: GitHubStatsProps) {
  const [stats, setStats] = useState({
    commits: 0,
    stars: 0,
    repos: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/github?username=${username}`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching GitHub stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchStats();
  }, [username]);

  return (
    <div className="github-stats">
      {loading ? (
        <div>Loading GitHub data...</div>
      ) : (
        <>
          <div className="stat-item">
            <span>📅 Total Commits (30d):</span>
            <strong>{stats.commits}</strong>
          </div>
          <div className="stat-item">
            <span>⭐ Stars Received:</span>
            <strong>{stats.stars}</strong>
          </div>
          <div className="repos-list">
            <h4>Top Repositories</h4>
            {stats.repos.slice(0, 3).map((repo: any) => (
              <div key={repo.name} className="repo-item">
                <a href={repo.url} target="_blank" rel="noopener noreferrer">
                  {repo.name}
                </a>
                <span>🌟 {repo.stars}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}