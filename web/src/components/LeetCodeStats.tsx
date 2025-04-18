// Updated LeetCodeStats.tsx
import { useEffect, useState } from 'react';

interface LeetCodeStatsProps {
  username: string;
}

export default function LeetCodeStats({ username }: LeetCodeStatsProps) {
  const [stats, setStats] = useState<{ solved?: number; streak?: number }>({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/leetcode?username=${username}`);
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to load LeetCode stats');
      }
    };

    fetchStats();
  }, [username]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!stats.solved && !stats.streak) {
    return <div className="loading">Loading LeetCode stats...</div>;
  }

  return (
    <div className="leetcode-stats">
      <div className="stat-item">
        <span>✅ Problems Solved:</span>
        <strong>{stats.solved?.toLocaleString()}</strong>
      </div>
      <div className="stat-item">
        <span>🔥 Current Streak:</span>
        <strong>{stats.streak} days</strong>
      </div>
    </div>
  );
}