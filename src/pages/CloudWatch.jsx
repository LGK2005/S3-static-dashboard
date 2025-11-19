import React from 'react';
import Table from '../components/Table';

const CloudWatch = () => {
  const cloudWatchData = [
    { AccountID: '123456789012', VPCID: 'vpc-0abcdef1234567890', Region: 'us-east-1', queryName: 'CPUUtilization', 'srcid-instance': 'i-0abcdef1234567890' },
    { AccountID: '123456789012', VPCID: 'vpc-0abcdef1234567890', Region: 'us-west-2', queryName: 'NetworkIn', 'srcid-instance': 'i-0fedcba9876543210' },
    { AccountID: '123456789012', VPCID: 'vpc-0abcdef1234567890', Region: 'eu-central-1', queryName: 'DiskReadBytes', 'srcid-instance': 'i-0123456789abcdef0' },
    { AccountID: '123456789012', VPCID: 'vpc-0abcdef1234567890', Region: 'ap-southeast-1', queryName: 'MemoryUtilization', 'srcid-instance': 'i-0abcdef1234567891' },
    { AccountID: '123456789012', VPCID: 'vpc-0abcdef1234567890', Region: 'ca-central-1', queryName: 'DiskWriteBytes', 'srcid-instance': 'i-0fedcba9876543211' },
    { AccountID: '123456789012', VPCID: 'vpc-0abcdef1234567890', Region: 'sa-east-1', queryName: 'StatusCheckFailed', 'srcid-instance': 'i-0123456789abcdef1' },
  ];

  const headers = ["AccountID", "VPCID", "Region", "queryName", "srcid-instance"];

  return (
    <div className="dashboard-container">
      <h2>CloudWatch Dashboard</h2>
      <Table headers={headers} data={cloudWatchData} />
    </div>
  );
};

export default CloudWatch;
