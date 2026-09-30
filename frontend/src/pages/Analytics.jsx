import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import { PieChart as PieChartIcon, TrendingUp, IndianRupee } from 'lucide-react';

export default function Analytics() {
  const [sectorData, setSectorData] = useState([]);
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/sectors'),
      api.get('/risk/overview')
    ]).then(([sectorRes, overviewRes]) => {
      setSectorData(sectorRes.data);
      setOverviewData(overviewRes.data);
      setLoading(false);
    });
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading || !overviewData) return <div className="p-6">Loading Analytics...</div>;

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const pieData = [
    { name: 'Critical', value: overviewData.distribution.critical },
    { name: 'High', value: overviewData.distribution.high },
    { name: 'Moderate', value: overviewData.distribution.moderate },
    { name: 'Low', value: overviewData.distribution.low },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <PieChartIcon className="text-blue-600" /> Portfolio Analytics
        </h1>
        <p className="text-slate-500 mt-1">Macro-level insights and risk distributions across all tracked projects.</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI Cards */}
        <motion.div variants={item} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center text-center hover:border-blue-300 transition-colors">
          <p className="text-slate-500 font-medium mb-2">Total Monitored Projects</p>
          <div className="text-4xl font-black text-slate-800">{overviewData.totalProjects}</div>
          <p className="text-xs text-slate-400 mt-2">Across 3 Ministries</p>
        </motion.div>

        <motion.div variants={item} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center text-center hover:border-blue-300 transition-colors">
          <p className="text-slate-500 font-medium mb-2 flex items-center justify-center gap-2">
            <IndianRupee size={16} /> Total Cost Exposure
          </p>
          <div className="text-3xl font-black text-red-600">+₹{overviewData.potentialCostExposure.toLocaleString()} Cr</div>
          <p className="text-xs text-slate-400 mt-2">Cumulative cost escalation</p>
        </motion.div>

        <motion.div variants={item} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center text-center hover:border-blue-300 transition-colors">
          <p className="text-slate-500 font-medium mb-2 flex items-center justify-center gap-2">
            <TrendingUp size={16} /> Avg Sector Risk
          </p>
          <div className="text-4xl font-black text-orange-500">
            {Math.round(sectorData.reduce((acc, curr) => acc + curr.avgRisk, 0) / (sectorData.length || 1))}
          </div>
          <p className="text-xs text-slate-400 mt-2">Overall portfolio risk score</p>
        </motion.div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Risk Chart */}
        <motion.div variants={item} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Average Risk by Sector</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="sector" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="avgRisk" name="Avg Risk Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Risk Distribution Chart */}
        <motion.div variants={item} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Risk Distribution</h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
