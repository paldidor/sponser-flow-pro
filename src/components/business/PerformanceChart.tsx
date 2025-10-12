import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const data = [
  { month: 'Jan', reach: 45000, engagement: 2400, spend: 7200, sponsorships: 8, impact: 650 },
  { month: 'Feb', reach: 52000, engagement: 3200, spend: 7800, sponsorships: 9, impact: 720 },
  { month: 'Mar', reach: 48000, engagement: 2800, spend: 6900, sponsorships: 7, impact: 680 },
  { month: 'Apr', reach: 67000, engagement: 4100, spend: 8500, sponsorships: 11, impact: 780 },
  { month: 'May', reach: 71000, engagement: 4800, spend: 9200, sponsorships: 12, impact: 820 },
  { month: 'Jun', reach: 85000, engagement: 5600, spend: 8700, sponsorships: 12, impact: 847 }
];

export function PerformanceChart() {
  const [timeRange, setTimeRange] = useState('6months');
  const [metric, setMetric] = useState('all');

  const shouldShowLine = (lineMetric: string) => {
    if (metric === 'all') return true;
    if (metric === lineMetric) return true;
    if (metric === 'reach-engagement' && (lineMetric === 'reach' || lineMetric === 'engagement')) return true;
    if (metric === 'spend-sponsorships-impact' && (lineMetric === 'spend' || lineMetric === 'sponsorships' || lineMetric === 'impact')) return true;
    return false;
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      {/* Header with Title and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-lg font-semibold text-[#545454] mb-4 sm:mb-0">
          Performance Overview
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Time Range Filter */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          {/* Metric Filter */}
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="reach">Reach Only</SelectItem>
              <SelectItem value="engagement">Engagement Only</SelectItem>
              <SelectItem value="spend">Spend Only</SelectItem>
              <SelectItem value="sponsorships">Sponsorships Only</SelectItem>
              <SelectItem value="impact">Impact Only</SelectItem>
              <SelectItem value="reach-engagement">Reach & Engagement</SelectItem>
              <SelectItem value="spend-sponsorships-impact">Spend, Sponsorships & Impact</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#545454" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#545454" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#545454'
              }}
            />
            <Legend />
            
            {/* Reach Line */}
            {shouldShowLine('reach') && (
              <Line 
                type="monotone" 
                dataKey="reach" 
                stroke="#00aafe" 
                strokeWidth={3}
                name="Reach"
                dot={{ fill: '#00aafe', strokeWidth: 2 }}
              />
            )}
            
            {/* Engagement Line */}
            {shouldShowLine('engagement') && (
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#ffb82d" 
                strokeWidth={3}
                name="Engagement"
                dot={{ fill: '#ffb82d', strokeWidth: 2 }}
              />
            )}
            
            {/* Spend Line */}
            {shouldShowLine('spend') && (
              <Line 
                type="monotone" 
                dataKey="spend" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Spend ($)"
                dot={{ fill: '#10b981', strokeWidth: 2 }}
              />
            )}
            
            {/* Sponsorships Line */}
            {shouldShowLine('sponsorships') && (
              <Line 
                type="monotone" 
                dataKey="sponsorships" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                name="Sponsorships"
                dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
              />
            )}
            
            {/* Impact Line */}
            {shouldShowLine('impact') && (
              <Line 
                type="monotone" 
                dataKey="impact" 
                stroke="#f59e0b" 
                strokeWidth={3}
                name="Impact"
                dot={{ fill: '#f59e0b', strokeWidth: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
