import React from 'react';
import Table from '../components/Table';

const GuardDuty = () => {
  const guardDutyData = [
    { FindType: 'UnauthorizedAccess', Severity: 'High', Region: 'us-east-1', AccountID: '123456789012', CreateAt: '2023-10-26T10:00:00Z', Date: '2023-10-26' },
    { FindType: 'PortScan', Severity: 'Low', Region: 'us-west-2', AccountID: '123456789012', CreateAt: '2023-10-25T14:30:00Z', Date: '2023-10-25' },
    { FindType: 'BruteForce', Severity: 'Medium', Region: 'eu-central-1', AccountID: '123456789012', CreateAt: '2023-10-24T08:15:00Z', Date: '2023-10-24' },
    { FindType: 'S3:BucketPubliclyAccessible', Severity: 'High', Region: 'us-east-1', AccountID: '123456789012', CreateAt: '2023-10-23T11:00:00Z', Date: '2023-10-23' },
    { FindType: 'EC2:PortProbeUnusual', Severity: 'Low', Region: 'ap-southeast-2', AccountID: '123456789012', CreateAt: '2023-10-22T16:45:00Z', Date: '2023-10-22' },
    { FindType: 'IAMUser:AnomalousBehavior', Severity: 'Medium', Region: 'eu-west-1', AccountID: '123456789012', CreateAt: '2023-10-21T09:00:00Z', Date: '2023-10-21' },
  ];

  const headers = ["FindType", "Severity", "Region", "AccountID", "CreateAt", "Date"];

  return (
    <div className="dashboard-container">
      <h2>GuardDuty Dashboard</h2>
      <Table headers={headers} data={guardDutyData} />
    </div>
  );
};

export default GuardDuty;
