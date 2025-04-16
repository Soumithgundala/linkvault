// src/components/LeetCodeStats.tsx
import { useEffect, useState } from 'react';

interface LeetCodeStatsProps {
  data: {
    solved: number;
    streak: number;
  };
}

export default function LeetCodeStats({ data }: LeetCodeStatsProps) {
  return (
    <div className="leetcode-stats">
      <div className="stat-item">
        <span>✅ Problems Solved:</span>
        <strong>{data.solved}</strong>
      </div>
      <div className="stat-item">
        <span>🔥 Current Streak:</span>
        <strong>{data.streak} days</strong>
      </div>
      <div className="calendar-placeholder">
        {/* Add your heatmap implementation here */}
        <p>Streak Calendar (implement with SVG/D3)</p>
      </div>
    </div>
  );
}