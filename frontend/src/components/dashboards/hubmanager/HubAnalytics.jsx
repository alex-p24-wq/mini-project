import React, { useState, useEffect } from 'react';

export default function HubAnalytics({ hubData }) {
  const [analyticsData, setAnalyticsData] = useState({});
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = () => {
    // Mock analytics data
    const mockAnalytics = {
      revenue: {
        current: 485000,
        previous: 420000,
        growth: 15.5,
        chartData: [
          { period: 'Week 1', value: 120000 },
          { period: 'Week 2', value: 135000 },
          { period: 'Week 3', value: 110000 },
          { period: 'Week 4', value: 120000 }
        ]
      },
      volume: {
        current: 3250,
        previous: 2890,
        growth: 12.5,
        chartData: [
          { period: 'Week 1', value: 850 },
          { period: 'Week 2', value: 920 },
          { period: 'Week 3', value: 780 },
          { period: 'Week 4', value: 700 }
        ]
      },
      quality: {
        average: 8.7,
        previous: 8.4,
        distribution: [
          { grade: 'Premium', percentage: 45, count: 68 },
          { grade: 'Organic', percentage: 35, count: 52 },
          { grade: 'Regular', percentage: 20, count: 30 }
        ]
      },
      farmers: {
        active: 156,
        new: 12,
        topPerformers: [
          { name: 'Meera Thomas', deliveries: 45, quality: 9.5 },
          { name: 'Priya Nair', deliveries: 32, quality: 9.2 },
          { name: 'Ravi Kumar', deliveries: 24, quality: 8.9 }
        ]
      }
    };
    setAnalyticsData(mockAnalytics);
  };

  const MetricCard = ({ title, current, previous, growth, unit, icon }) => (
    <div className="metric-card">
      <div className="metric-header">
        <div className="metric-icon">{icon}</div>
        <h3>{title}</h3>
      </div>
      <div className="metric-value">
        <h2>{current?.toLocaleString()}{unit}</h2>
        <div className={`metric-growth ${growth >= 0 ? 'positive' : 'negative'}`}>
          {growth >= 0 ? '↗️' : '↘️'} {Math.abs(growth)}%
        </div>
      </div>
      <div className="metric-comparison">
        vs {previous?.toLocaleString()}{unit} last {timeRange}
      </div>
    </div>
  );

  const ChartCard = ({ title, data, type = 'bar' }) => (
    <div className="chart-card">
      <h3>{title}</h3>
      <div className="chart-container">
        {type === 'bar' && (
          <div className="bar-chart">
            {data?.map((item, index) => (
              <div key={index} className="bar-item">
                <div 
                  className="bar" 
                  style={{ height: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%` }}
                ></div>
                <span className="bar-label">{item.period}</span>
                <span className="bar-value">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="hub-analytics">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <h2>Analytics & Reports</h2>
          <p>Track performance and insights for your hub</p>
        </div>
        <div className="time-range-selector">
          <button 
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button 
            className={timeRange === 'quarter' ? 'active' : ''}
            onClick={() => setTimeRange('quarter')}
          >
            Quarter
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Revenue"
          current={analyticsData.revenue?.current}
          previous={analyticsData.revenue?.previous}
          growth={analyticsData.revenue?.growth}
          unit="₹"
          icon="💰"
        />
        <MetricCard
          title="Volume Processed"
          current={analyticsData.volume?.current}
          previous={analyticsData.volume?.previous}
          growth={analyticsData.volume?.growth}
          unit=" kg"
          icon="📦"
        />
        <MetricCard
          title="Average Quality"
          current={analyticsData.quality?.average}
          previous={analyticsData.quality?.previous}
          growth={((analyticsData.quality?.average - analyticsData.quality?.previous) / analyticsData.quality?.previous * 100)}
          unit="/10"
          icon="⭐"
        />
        <MetricCard
          title="Active Farmers"
          current={analyticsData.farmers?.active}
          previous={analyticsData.farmers?.active - analyticsData.farmers?.new}
          growth={(analyticsData.farmers?.new / (analyticsData.farmers?.active - analyticsData.farmers?.new) * 100)}
          unit=""
          icon="👨‍🌾"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <ChartCard
          title="Revenue Trend"
          data={analyticsData.revenue?.chartData}
          type="bar"
        />
        <ChartCard
          title="Volume Processed"
          data={analyticsData.volume?.chartData}
          type="bar"
        />
      </div>

      {/* Quality Distribution */}
      <div className="quality-section">
        <h3>Quality Grade Distribution</h3>
        <div className="quality-distribution">
          {analyticsData.quality?.distribution?.map(grade => (
            <div key={grade.grade} className="quality-item">
              <div className="quality-header">
                <span className="grade-name">{grade.grade}</span>
                <span className="grade-percentage">{grade.percentage}%</span>
              </div>
              <div className="quality-bar">
                <div 
                  className="quality-fill"
                  style={{ width: `${grade.percentage}%` }}
                ></div>
              </div>
              <div className="quality-count">{grade.count} batches</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="top-performers">
        <h3>Top Performing Farmers</h3>
        <div className="performers-list">
          {analyticsData.farmers?.topPerformers?.map((farmer, index) => (
            <div key={farmer.name} className="performer-item">
              <div className="performer-rank">#{index + 1}</div>
              <div className="performer-info">
                <h4>{farmer.name}</h4>
                <p>{farmer.deliveries} deliveries</p>
              </div>
              <div className="performer-quality">
                <span className="quality-score">{farmer.quality}/10</span>
                <span className="quality-label">Quality</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="export-section">
        <h3>Export Reports</h3>
        <div className="export-buttons">
          <button className="btn-secondary">📊 Revenue Report</button>
          <button className="btn-secondary">📦 Inventory Report</button>
          <button className="btn-secondary">👨‍🌾 Farmer Report</button>
          <button className="btn-secondary">📈 Performance Report</button>
        </div>
      </div>
    </div>
  );
}
