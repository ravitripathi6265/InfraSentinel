import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, Filter, AlertTriangle, ArrowRight } from 'lucide-react';

export default function RiskRadar() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/projects').then(res => {
      setProjects(res.data.sort((a, b) => b.riskScore - a.riskScore));
      setLoading(false);
    });
  }, []);

  const filteredProjects = projects.filter(p => 
    p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6">Loading Risk Radar...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Risk Radar</h1>
        <p className="text-sm text-slate-500 mt-1">Detailed risk monitoring table with AI-assisted scoring.</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, code, or sector..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
          <Filter size={16} /> Filters
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-medium">
                <th className="px-6 py-4 border-b border-slate-200">Project</th>
                <th className="px-6 py-4 border-b border-slate-200">Sector</th>
                <th className="px-6 py-4 border-b border-slate-200 text-center">Progress</th>
                <th className="px-6 py-4 border-b border-slate-200 text-right">Cost (Cr)</th>
                <th className="px-6 py-4 border-b border-slate-200 text-center">Risk Score</th>
                <th className="px-6 py-4 border-b border-slate-200 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{p.projectName}</div>
                    <div className="text-xs text-slate-500">{p.projectCode} • {p.ministry}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs border border-slate-200">{p.sector}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-slate-700">{p.actualProgress}%</span>
                      {p.plannedProgress > p.actualProgress && (
                        <span className="text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle size={10} /> -{(p.plannedProgress - p.actualProgress).toFixed(1)}% gap
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-medium text-slate-700">₹{p.revisedCost.toLocaleString()}</div>
                    {p.revisedCost > p.originalCost && (
                      <div className="text-xs text-red-500">+₹{(p.revisedCost - p.originalCost).toLocaleString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm border-2 ${
                      p.riskScore >= 75 ? 'bg-red-50 text-red-700 border-red-500' :
                      p.riskScore >= 50 ? 'bg-orange-50 text-orange-700 border-orange-500' :
                      'bg-green-50 text-green-700 border-green-500'
                    }`}>
                      {p.riskScore}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                    >
                      <span>View Project</span>
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
