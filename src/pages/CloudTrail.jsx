import React from 'react';
import Table from '../components/Table';

const CloudTrail = () => {
  const cloudTrailData = [
    { eventTime: '2023-10-26T10:00:00Z', eventName: 'ConsoleLogin', userType: 'IAMUser', userName: 'admin', AccountID: '123456789012' },
    { eventTime: '2023-10-25T14:30:00Z', eventName: 'StartInstances', userType: 'Root', userName: 'root', AccountID: '123456789012' },
    { eventTime: '2023-10-24T08:15:00Z', eventName: 'StopInstances', userType: 'AssumedRole', userName: 'dev-role', AccountID: '123456789012' },
    { eventTime: '2023-10-23T11:00:00Z', eventName: 'CreateBucket', userType: 'IAMUser', userName: 's3-admin', AccountID: '123456789012' },
    { eventTime: '2023-10-22T16:45:00Z', eventName: 'DeleteObject', userType: 'AssumedRole', userName: 'app-role', AccountID: '123456789012' },
    { eventTime: '2023-10-21T09:00:00Z', eventName: 'UpdateFunctionConfiguration', userType: 'IAMUser', userName: 'lambda-dev', AccountID: '123456789012' },
  ];

  const headers = ["eventTime", "eventName", "userType", "userName", "AccountID"];

  return (
    <div className="dashboard-container">
      <h2>CloudTrail Dashboard</h2>
      <Table headers={headers} data={cloudTrailData} />
    </div>
  );
};

export default CloudTrail;
