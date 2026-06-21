import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <span className="spinner-text">{text}</span>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 5 }) => {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.1}s` }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton skeleton-cell" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
