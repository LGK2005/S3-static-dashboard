import React from 'react';

const Summary = () => {
  const data = {
    total: 12,
    low: 12,
    medium: 12,
    high: 12,
  };

  return (
    <div className="summary-cards-container">
      <div className="summary-card">
        <h3>Total Findings</h3>
        <p>{data.total}</p>
      </div>
      <div className="summary-card">
        <h3>Low Severity</h3>
        <p>{data.low}</p>
      </div>
      <div className="summary-card">
        <h3>Medium Severity</h3>
        <p>{data.medium}</p>
      </div>
      <div className="summary-card">
        <h3>High Severity</h3>
        <p>{data.high}</p>
      </div>
    </div>
  );
};

export default Summary;
