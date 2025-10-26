import React, { useState, useEffect } from 'react';
import { useHubNetwork } from '../../../contexts/HubNetworkContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, Table, Tag, Space, Typography, Input, Row, Col, Statistic, Select } from 'antd';
import { 
  ShopOutlined, 
  UserOutlined, 
  DollarOutlined, 
  SearchOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import './HubNetwork.css';

const { Title, Text } = Typography;
const { Option } = Select;

export default function HubNetwork() {
  const { 
    getRequestsByDistrict, 
    getAllDistrictsWithRequests,
    acceptedRequests 
  } = useHubNetwork();
  
  const { user } = useAuth();
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [allDistricts, setAllDistricts] = useState([]);
  
  // Get all districts with requests
  useEffect(() => {
    const districts = getAllDistrictsWithRequests();
    setAllDistricts(districts);
    
    // Auto-select the first district if none selected
    if (districts.length > 0 && !selectedDistrict) {
      setSelectedDistrict(districts[0].district);
    }
  }, [acceptedRequests]);

  // Get requests for selected district
  const districtRequests = selectedDistrict ? getRequestsByDistrict(selectedDistrict) : [];
  
  // Apply filters
  const filteredRequests = districtRequests.filter(request => {
    const matchesSearch = request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalRequests = districtRequests.length;
  const totalAmount = districtRequests.reduce((sum, req) => sum + (req.totalAmount || 0), 0);
  const completedRequests = districtRequests.filter(r => r.status === 'completed').length;

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'requestId',
      key: 'requestId',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <Space>
          <DollarOutlined />
          <span>₹{amount?.toLocaleString('en-IN') || '0'}</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let icon = null;
        
        switch(status) {
          case 'accepted':
            color = 'blue';
            icon = <CheckCircleOutlined />;
            break;
          case 'processing':
            color = 'orange';
            icon = <ClockCircleOutlined />;
            break;
          case 'completed':
            color = 'green';
            icon = <CheckCircleOutlined />;
            break;
          default:
            color = 'default';
        }
        
        return (
          <Tag color={color} icon={icon}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="hub-network-container">
      <Title level={2} style={{ marginBottom: 24 }}>
        <EnvironmentOutlined /> Hub Network
      </Title>
      
      {/* District Selector */}
      <div className="district-selector">
        <Select
          style={{ width: 300, marginRight: 16 }}
          placeholder="Select District"
          value={selectedDistrict}
          onChange={setSelectedDistrict}
          optionLabelProp="label"
        >
          {allDistricts.map(district => (
            <Option 
              key={district.district} 
              value={district.district}
              label={
                <span>
                  <ShopOutlined /> {district.district}
                </span>
              }
            >
              <div>
                <div>{district.district}</div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {district.requestCount} requests • ₹{district.totalAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </Option>
          ))}
        </Select>
        
        <div className="district-stats">
          <Statistic 
            title="Total Requests" 
            value={totalRequests} 
            prefix={<ShopOutlined />} 
          />
          <Statistic 
            title="Total Amount" 
            value={totalAmount} 
            prefix="₹" 
            valueStyle={{ color: '#3f8600' }} 
          />
          <Statistic 
            title="Completed" 
            value={completedRequests} 
            suffix={`/ ${totalRequests}`} 
            prefix={<CheckCircleOutlined />}
          />
        </div>
      </div>
      
      {/* Filters */}
      <div className="filters" style={{ margin: '16px 0' }}>
        <Input
          placeholder="Search requests..."
          prefix={<SearchOutlined />}
          style={{ width: 300, marginRight: 16 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select
          style={{ width: 200 }}
          placeholder="Filter by status"
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
        >
          <Option value="all">All Statuses</Option>
          <Option value="accepted">Accepted</Option>
          <Option value="processing">Processing</Option>
          <Option value="completed">Completed</Option>
        </Select>
      </div>
      
      {/* Requests Table */}
      <Card>
        <Table 
          columns={columns} 
          dataSource={filteredRequests} 
          rowKey="requestId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
}
