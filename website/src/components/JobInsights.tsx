"use client"
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
  ComposedChart, Scatter
} from 'recharts';

// Define TypeScript interfaces
interface JobData {
  Job_Title: string;
  Salary_USD: number;
  Industry: string;
  Remote_Friendly: string;
  Automation_Risk: string;
  AI_Adoption_Level: string;
  Job_Growth_Projection: string;
}

interface SalaryByTitle {
  Job_Title: string;
  Salary_USD: number;
}

interface IndustryDistribution {
  Industry: string;
  value: number;
}

interface JobMarketData {
  salary_by_title: SalaryByTitle[];
  industry_distribution: IndustryDistribution[];
  raw_data: JobData[];
}

// Custom interfaces for chart data
interface SalaryRange {
  range: string;
  count: number;
}

interface AdoptionLevelData {
  AI_Adoption_Level: string;
  AverageSalary: number;
  count: number;
}

interface IndustryRemoteData {
  Industry: string;
  Remote: number;
  'Non-Remote': number;
}

interface JobGrowthData {
  Job_Title: string;
  High: number;
  Moderate: number;
  Low: number;
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#4ade80', '#fcd34d', '#38bdf8'];

// Add global styles to the head of the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #1f2937;
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb {
      background: #4b5563;
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #60a5fa;
    }
  `;
  document.head.appendChild(style);
}
const JobInsights = () => {
  const [data, setData] = useState<JobMarketData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/job-analysis');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jobData = await response.json();
        setData(jobData);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-200">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <span className="text-xl">Loading job market data...</span>
    </div>
  </div>;

  if (error) return <div className="flex items-center justify-center h-screen bg-gray-900 text-red-400">
    <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl border border-red-500/30">
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="mt-4 text-xl font-semibold">Error</h3>
      <p className="mt-2">{error}</p>
    </div>
  </div>;

  if (!data) return <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-200">
    <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
      <p className="text-xl">No data available</p>
    </div>
  </div>;

  // Process data for specific charts
  const salaryByTitle: SalaryByTitle[] = data.salary_by_title
    .sort((a, b) => b.Salary_USD - a.Salary_USD)
    .slice(0, 10);

  // Group data for Salary Distribution histogram
  const salaryRanges = [0, 50000, 75000, 100000, 125000, 150000, 175000, 200000];
  const salaryDistribution: SalaryRange[] = salaryRanges.map((min, i) => {
    const max = salaryRanges[i + 1] || Infinity;
    const count = data.raw_data.filter(job =>
      job.Salary_USD >= min && (max === Infinity || job.Salary_USD < max)).length;

    return {
      range: max === Infinity ? `$${min / 1000}k+` : `$${min / 1000}k-${max / 1000}k`,
      count
    };
  }).filter(range => range.count > 0);

  // Process data for AI Adoption Level vs Salary
  const adoptionLevelData: AdoptionLevelData[] = [...new Set(data.raw_data.map(item => item.AI_Adoption_Level))]
    .map(level => {
      const jobsWithLevel = data.raw_data.filter(job => job.AI_Adoption_Level === level);
      const avgSalary = jobsWithLevel.reduce((sum, job) => sum + job.Salary_USD, 0) / jobsWithLevel.length;

      return {
        AI_Adoption_Level: level,
        AverageSalary: Math.round(avgSalary),
        count: jobsWithLevel.length
      };
    });

  // Process data for Remote-Friendly Jobs by Industry
  const industryRemoteData: IndustryRemoteData[] = [...new Set(data.raw_data.map(item => item.Industry))]
    .map(industry => {
      const industryJobs = data.raw_data.filter(job => job.Industry === industry);
      const remoteCount = industryJobs.filter(job => job.Remote_Friendly === "Yes").length;
      const nonRemoteCount = industryJobs.filter(job => job.Remote_Friendly === "No").length;

      return {
        Industry: industry,
        Remote: remoteCount,
        'Non-Remote': nonRemoteCount
      };
    });

  // Process data for Job Growth Projections
  const growthData: JobGrowthData[] = [...new Set(data.raw_data.map(item => item.Job_Title))]
    .map(title => {
      const jobsWithTitle = data.raw_data.filter(job => job.Job_Title === title);
      const highCount = jobsWithTitle.filter(job => job.Job_Growth_Projection === "High").length;
      const moderateCount = jobsWithTitle.filter(job => job.Job_Growth_Projection === "Moderate").length;
      const lowCount = jobsWithTitle.filter(job => job.Job_Growth_Projection === "Low").length;

      return {
        Job_Title: title,
        High: highCount,
        Moderate: moderateCount,
        Low: lowCount
      };
    });

  // Custom rendering for the pie chart label
  const renderCustomizedPieLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, Industry } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="scroll-container overflow-y-auto pb-8" style={{ maxHeight: 'calc(100vh - 180px)' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Average Salary by Job Title */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500/30 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Average Salary by Job Title</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salaryByTitle}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  type="number"
                  tickFormatter={(value: number) => `$${value.toLocaleString()}`}
                  stroke="#9ca3af"
                />
                <YAxis
                  type="category"
                  dataKey="Job_Title"
                  width={80}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Salary"]}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#e5e7eb' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Bar
                  dataKey="Salary_USD"
                  fill="#60a5fa"
                  name="Average Salary"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution of Jobs by Industry */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500/30 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Distribution of Jobs by Industry</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.industry_distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="Industry"
                  label={renderCustomizedPieLabel}
                >
                  {data.industry_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => {
                    return [`${value} jobs`, props.payload.Industry];
                  }}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#e5e7eb' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Distribution */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500/30 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Salary Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salaryDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#e5e7eb' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Bar
                  dataKey="count"
                  fill="#f87171"
                  name="Number of Jobs"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary vs AI Adoption Level */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500/30 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Salary vs AI Adoption Level</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={adoptionLevelData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid stroke="#374151" />
                <XAxis dataKey="AI_Adoption_Level" scale="band" stroke="#9ca3af" />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#a78bfa"
                  tickFormatter={(value: number) => `$${(value / 1000)}k`}
                />
                <YAxis yAxisId="right" orientation="right" stroke="#4ade80" />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    return name === "AverageSalary"
                      ? [`$${value.toLocaleString()}`, "Average Salary"]
                      : [value, "Job Count"];
                  }}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#e5e7eb' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Legend wrapperStyle={{ color: '#e5e7eb' }} />
                <Bar
                  yAxisId="right"
                  dataKey="count"
                  barSize={20}
                  fill="#4ade80"
                  name="Number of Jobs"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="AverageSalary"
                  stroke="#a78bfa"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  name="Average Salary"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Remote-Friendly Jobs by Industry */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500/30 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Remote-Friendly Jobs by Industry</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={industryRemoteData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="Industry" angle={-45} textAnchor="end" height={80} stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#e5e7eb' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Legend wrapperStyle={{ color: '#e5e7eb' }} />
                <Bar dataKey="Remote" stackId="a" fill="#34d399" name="Remote" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Non-Remote" stackId="a" fill="#f87171" name="Non-Remote" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job Growth Projections */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500/30 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Job Growth Projections</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={growthData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="Job_Title"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke="#9ca3af"
                />
                <YAxis
                  stroke="#9ca3af"
                  domain={[0, 'dataMax + 10']} // Ensures some padding
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    borderColor: '#4b5563',
                    borderRadius: '0.5rem'
                  }}
                  itemStyle={{ color: '#e5e7eb' }}
                  labelStyle={{ color: '#e5e7eb' }}
                  formatter={(value) => [value, 'Jobs']}
                />
                <Legend
                  wrapperStyle={{ color: '#e5e7eb' }}
                  formatter={(value) => <span className="text-xs">{value}</span>}
                />
                <Bar
                  dataKey="High"
                  fill="#60a5faff" // Full opacity
                  name="High Growth"
                  radius={[4, 0, 0, 0]}
                  minPointSize={5} // Minimum bar height
                />
                <Bar
                  dataKey="Moderate"
                  fill="#fbbf24ff"
                  name="Moderate Growth"
                  radius={[0, 0, 0, 0]}
                  minPointSize={5}
                />
                <Bar
                  dataKey="Low"
                  fill="#f87171ff"
                  name="Low Growth"
                  radius={[0, 4, 0, 0]}
                  minPointSize={5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobInsights