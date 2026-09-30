import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { FileText, Printer, Download, Sparkles } from 'lucide-react';

export default function ExecutiveReports() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/projects').then(res => {
      setProjects(res.data.sort((a, b) => b.riskScore - a.riskScore));
      if (res.data.length > 0) setSelectedProjectId(res.data[0].id);
    });
  }, []);

  const generateReport = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    setReport('');
    try {
      const res = await api.post('/executive-brief', { projectId: selectedProjectId });
      setReport(res.data.report);
    } catch (err) {
      setReport("Error generating report. Please check API connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="text-blue-600" /> Executive Briefings
        </h1>
        <p className="text-slate-500 mt-1">Generate AI-powered, print-ready summaries for high-level stakeholders.</p>
      </motion.div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Project to Brief</label>
          <select 
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                [{p.riskScore}] {p.projectName} ({p.projectCode})
              </option>
            ))}
          </select>
        </div>
        <button 
          onClick={generateReport}
          disabled={loading || projects.length === 0}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? <span className="animate-pulse">Drafting...</span> : <><Sparkles size={18} /> Generate Brief</>}
        </button>
      </div>

      {loading && (
        <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">SI Ignite AI is compiling project evidence...</p>
        </div>
      )}

      {report && !loading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
        >
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <FileText size={18} /> Official AI Briefing Document
            </h3>
            <div className="flex gap-2">
              <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Print">
                <Printer size={18} />
              </button>
              <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Download PDF">
                <Download size={18} />
              </button>
            </div>
          </div>
          <div className="p-8 prose prose-slate max-w-none prose-h2:text-blue-800 prose-h3:text-slate-800 prose-a:text-blue-600 whitespace-pre-wrap font-serif">
            {report}
          </div>
        </motion.div>
      )}
    </div>
  );
}
