import React from 'react';
import Header from '../components/Header';
import Summary from '../components/Summary';

const DashboardLayout = ({ children, setActiveDashboard }) => {
  return (
    <div className="container">
      <Header />
      <Summary />
      <div className="dashboard-selector">
        <button onClick={() => setActiveDashboard('GuardDuty')}>GuardDuty</button>
        <button onClick={() => setActiveDashboard('CloudWatch')}>CloudWatch</button>
        <button onClick={() => setActiveDashboard('CloudTrail')}>CloudTrail</button>
      </div>
      {children}
    </div>
  );
};

export default DashboardLayout;
