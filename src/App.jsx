import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Summary from './components/Summary';
import DashboardLayout from './layouts/DashboardLayout';
import GuardDuty from './pages/GuardDuty';
import CloudWatch from './pages/CloudWatch';
import CloudTrail from './pages/CloudTrail';

function App() {
  const [activeDashboard, setActiveDashboard] = useState('GuardDuty'); // Default to GuardDuty

  const renderDashboard = () => {
    switch (activeDashboard) {
      case 'GuardDuty':
        return <GuardDuty />;
      case 'CloudWatch':
        return <CloudWatch />;
      case 'CloudTrail':
        return <CloudTrail />;
      default:
        return <GuardDuty />;
    }
  };

  return (
    <DashboardLayout setActiveDashboard={setActiveDashboard}>
      {renderDashboard()}
    </DashboardLayout>
  );
}

export default App;
