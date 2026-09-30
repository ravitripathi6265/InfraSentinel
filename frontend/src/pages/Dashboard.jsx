import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, AlertCircle, Clock, Activity, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [topRisks, setTopRisks] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/risk/overview').then(res => setStats(res.data));
    api.get('/risk/top').then(res => setTopRisks(res.data));

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (!stats) return <div className="p-6">Loading Dashboard...</div>;

  const displayName = user?.name || (user?.username?.includes('ravi') ? 'Ravi Tripathi' : (user?.username || 'Officer'));
  const displayEmail = user?.email || (user?.username?.includes('@') ? user?.username : null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Portfolio Overview</h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
              MoSPI Live
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, <span className="font-semibold text-slate-800">{displayName}</span>
            {displayEmail && <span className="text-slate-400"> ({displayEmail})</span>} • Real-time infrastructure risk intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold border border-emerald-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Active User: {displayName}</span>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium border border-blue-200">
            <Activity size={14} /> Live Sync
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div variants={item} whileHover={{ y: -5 }} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/analytics')}>
          <div className="bg-slate-100 p-3 rounded-lg text-slate-600"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Monitored</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalProjects}</p>
          </div>
        </motion.div>

        <motion.div variants={item} whileHover={{ y: -5 }} className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/early-warnings')}>
          <div className="bg-red-100 p-3 rounded-lg text-red-600"><ShieldAlert size={24} /></div>
          <div>
            <p className="text-sm text-red-600 font-medium">Critical Risk</p>
            <p className="text-2xl font-bold text-red-700">{stats.distribution.critical}</p>
          </div>
        </motion.div>

        <motion.div variants={item} whileHover={{ y: -5 }} className="bg-white p-5 rounded-xl border border-orange-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/risk-radar')}>
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600"><AlertCircle size={24} /></div>
          <div>
            <p className="text-sm text-orange-600 font-medium">High Risk</p>
            <p className="text-2xl font-bold text-orange-700">{stats.distribution.high}</p>
          </div>
        </motion.div>

        <motion.div variants={item} whileHover={{ y: -5 }} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Clock size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Est. Cost Exposure</p>
            <p className="text-xl font-bold text-slate-800">+₹{stats.potentialCostExposure.toLocaleString()} Cr</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Top High-Risk Projects</h2>
            <button onClick={() => navigate('/risk-radar')} className="text-sm text-blue-600 font-medium hover:underline">View All</button>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-medium">
                  <th className="px-6 py-3 border-b border-slate-200">Project</th>
                  <th className="px-6 py-3 border-b border-slate-200 text-center">Score</th>
                  <th className="px-6 py-3 border-b border-slate-200 text-right">Cost (Cr)</th>
                  <th className="px-6 py-3 border-b border-slate-200 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {topRisks.slice(0, 5).map(p => (
                  <motion.tr 
                    whileHover={{ backgroundColor: "rgba(248,250,252,1)" }}
                    key={p.id} 
                    className="border-b border-slate-100 last:border-0 cursor-pointer"
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm">{p.projectName}</div>
                      <div className="text-xs text-slate-500">{p.projectCode} • {p.sector}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.riskScore >= 75 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {p.riskScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">
                      ₹{p.revisedCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <span>View Project</span>
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-slate-900 rounded-xl shadow-lg p-6 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-4">
              <ShieldAlert size={20} />
              <span className="font-bold uppercase tracking-wider text-xs">AI Risk Summary</span>
            </div>
            <h3 className="text-xl font-bold leading-snug mb-3">
              Sector Alert: Transport & Highways
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Based on recent trajectory data, 3 major highway projects are showing severe execution risks due to compounding milestone delays. Total at-risk capital is estimated at ₹12,000 Cr.
            </p>
          </div>
          <button 
            onClick={() => navigate('/early-warnings')}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded transition-colors"
          >
            View Early Warnings
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
