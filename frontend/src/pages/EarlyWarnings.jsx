import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { AlertOctagon, AlertTriangle, ArrowRight, ShieldAlert, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EarlyWarnings() {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/risk/early-warnings').then(res => {
      setWarnings(res.data);
      setLoading(false);
    });
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

  if (loading) return <div className="p-6">Loading AI Early Warnings...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-start gap-4"
      >
        <ShieldAlert size={32} className="text-red-600 mt-1 flex-shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-red-900">SI Ignite Predictive Early Warning System</h1>
          <p className="text-red-700 mt-1 text-sm">
            Statistical engine flagging {warnings.length} projects with severe future risk trajectory based on leading indicators (burn-to-progress gaps and critical-path slippages).
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4"
      >
        {warnings.map((warning, index) => (
          <motion.div
            key={warning.id}
            variants={item}
            whileHover={{ scale: 1.01 }}
            className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${warning.severity === 'CRITICAL' ? 'border-red-200 shadow-red-50' : 'border-orange-200 shadow-orange-50'
              }`}
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-1 flex-shrink-0">
                {warning.severity === 'CRITICAL' ? (
                  <AlertOctagon size={24} className="text-red-600 animate-pulse" />
                ) : (
                  <AlertTriangle size={24} className="text-orange-500" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${warning.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                    {warning.severity}
                  </span>
                  <span className="text-xs text-slate-400">{warning.date}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{warning.projectName} <span className="text-sm font-normal text-slate-500">({warning.projectCode})</span></h3>
                <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded border border-slate-100">
                  <span className="font-semibold text-slate-700">Trigger Evidence:</span> {warning.evidence}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 min-w-[200px]">
              <div className="text-xs text-right text-slate-500">
                <span className="block font-semibold">Recommended Action:</span>
                {warning.action}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/projects/${warning.id}`)}
                  className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 border border-slate-200"
                >
                  <span>View Project</span>
                  <ExternalLink size={12} />
                </button>
                <button
                  onClick={() => navigate('/forecasting', { state: { projectId: warning.id } })}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                  <span>Forecast Trajectory</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {warnings.length === 0 && (
          <div className="bg-green-50 p-8 rounded-xl border border-green-200 text-center text-green-700">
            No early warnings detected in the current portfolio snapshot.
          </div>
        )}
      </motion.div>
    </div>
  );
}
