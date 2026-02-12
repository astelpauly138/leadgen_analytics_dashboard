import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import Icon from '../../../components/AppIcon';

const CampaignChart = ({ data, timeRange, onTimeRangeChange }) => {
  const [chartType, setChartType] = useState('combined');

  const timeRanges = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: '1Y', value: '1y' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <span className="caption text-muted-foreground text-xs">{entry?.name}:</span>
              <span className="text-sm font-medium" style={{ color: entry?.color }}>
                {entry?.name === 'Success Rate' ? `${entry?.value}%` : entry?.value?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">Campaign Performance Trends</h2>
          <p className="caption text-muted-foreground text-sm">Email volume and success rate analysis</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {timeRanges?.map((range) => (
              <button
                key={range?.value}
                onClick={() => onTimeRangeChange(range?.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-250 touch-target ${
                  timeRange === range?.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range?.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setChartType('combined')}
              className={`p-2 rounded-md transition-all duration-250 touch-target ${
                chartType === 'combined' ? 'bg-card' : 'hover:bg-card/50'
              }`}
              title="Combined view"
            >
              <Icon name="BarChart3" size={16} />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md transition-all duration-250 touch-target ${
                chartType === 'bar' ? 'bg-card' : 'hover:bg-card/50'
              }`}
              title="Bar chart"
            >
              <Icon name="BarChart2" size={16} />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-md transition-all duration-250 touch-target ${
                chartType === 'line' ? 'bg-card' : 'hover:bg-card/50'
              }`}
              title="Line chart"
            >
              <Icon name="TrendingUp" size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="w-full h-64 md:h-80 lg:h-96" aria-label="Campaign Performance Chart">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'combined' ? (
            <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="period" 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                yAxisId="left"
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              <Bar 
                yAxisId="left"
                dataKey="emailsSent" 
                fill="var(--color-primary)" 
                name="Emails Sent"
                radius={[8, 8, 0, 0]}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="successRate" 
                stroke="var(--color-success)" 
                strokeWidth={3}
                name="Success Rate"
                dot={{ fill: 'var(--color-success)', r: 4 }}
              />
            </ComposedChart>
          ) : chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="period" 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              <Bar 
                dataKey="emailsSent" 
                fill="var(--color-primary)" 
                name="Emails Sent"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="period" 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="successRate" 
                stroke="var(--color-success)" 
                strokeWidth={3}
                name="Success Rate"
                dot={{ fill: 'var(--color-success)', r: 4 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CampaignChart;