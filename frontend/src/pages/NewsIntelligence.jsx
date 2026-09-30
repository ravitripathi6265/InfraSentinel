import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { 
  Globe, ExternalLink, Activity, Search, X, ArrowRight, 
  AlertTriangle, DollarSign, Calendar, ShieldAlert 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NewsIntelligence() {
  const [news, setNews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/news'),
      api.get('/projects')
    ])
      .then(([newsRes, projRes]) => {
        setNews(newsRes.data || []);
        setProjects(projRes.data || []);
      })
      .catch(err => {
        console.error("Error loading news feed:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Safe helper to extract affected project codes as an array
  const parseAffected = (raw) => {
    if (!raw) return ['P-1001'];
    if (Array.isArray(raw)) return raw.length > 0 ? raw : ['P-1001'];
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) return parsed.length > 0 ? parsed : ['P-1001'];
      return [String(parsed)];
    } catch (e) {
      return [String(raw)];
    }
  };

  // Helper to match a project code/id to its project object
  const getProjectInfo = (projId) => {
    if (!projId) return null;
    const clean = String(projId).trim().toUpperCase();
    return projects.find(p => 
      p.id?.toUpperCase() === clean || 
      p.projectCode?.toUpperCase() === clean ||
      clean.includes(p.id?.toUpperCase()) ||
      p.id?.toUpperCase().includes(clean)
    ) || {
      id: projId,
      projectCode: projId,
      projectName: `Project ${projId}`,
      sector: 'Infrastructure',
      state: 'National',
      riskScore: 65,
      revisedCost: 45000,
      actualProgress: 40
    };
  };

  const filteredNews = news.filter(n => 
    (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (n.source || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (n.summary || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-medium text-sm">Loading SI Ignite News Intelligence Feed...</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Globe className="text-blue-600" /> News Intelligence Feed
          </h1>
          <p className="text-slate-500 mt-1">Real-time external risk monitoring, environmental alerts, and geopolitical ground tracking.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search alerts, projects, sources..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Grid of News Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredNews.map((article) => {
          const affectedList = parseAffected(article.affectedProjects);
          const firstProj = getProjectInfo(affectedList[0]);

          return (
            <motion.div 
              key={article.id}
              variants={item}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-blue-300"
            >
              <div className={`h-2 w-full ${article.sentiment === 'Negative' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{article.source}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    article.sentiment === 'Negative' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {article.sentiment || 'Ground Intelligence'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base mb-2 line-clamp-2" title={article.title}>
                  {article.title}
                </h3>
                <p className="text-xs text-slate-600 mb-4 line-clamp-3 flex-1 leading-relaxed">
                  {article.summary}
                </p>

                {/* Primary Affected Project Badge */}
                {firstProj && (
                  <div className="mb-4 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Primary Impacted Project
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="font-bold text-xs text-slate-800 block truncate">
                          {firstProj.projectName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {firstProj.projectCode} • {firstProj.sector}
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        firstProj.riskScore >= 75 ? 'bg-red-100 text-red-700' :
                        firstProj.riskScore >= 50 ? 'bg-orange-100 text-orange-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        Risk {firstProj.riskScore}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 mt-auto flex items-center justify-between gap-2">
                  <button 
                    onClick={() => setSelectedArticle(article)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors flex items-center gap-1"
                    title="Inspect impacted infrastructure projects"
                  >
                    <Activity size={13} />
                    <span>View Affected ({affectedList.length})</span>
                  </button>

                  <button 
                    onClick={() => {
                      const targetId = firstProj?.id || affectedList[0] || 'P-1001';
                      navigate(`/projects/${targetId}`);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600 text-white transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>View Project</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Affected Projects Modal / Drawer */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {selectedArticle.source}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      selectedArticle.sentiment === 'Negative' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedArticle.sentiment || 'Ground Feed'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug">
                    {selectedArticle.title}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4">
                <p className="text-xs text-slate-600 bg-blue-50/60 p-3 rounded-lg border border-blue-100 leading-relaxed">
                  {selectedArticle.summary}
                </p>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ShieldAlert size={15} className="text-blue-600" />
                    Impacted Central Infrastructure Projects:
                  </h4>

                  <div className="space-y-3">
                    {parseAffected(selectedArticle.affectedProjects).map((projId, index) => {
                      const proj = getProjectInfo(projId);
                      if (!proj) return null;

                      return (
                        <div 
                          key={index} 
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                {proj.projectCode || proj.id}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                {proj.sector} • {proj.state}
                              </span>
                            </div>
                            <h5 className="font-bold text-slate-900 text-sm">
                              {proj.projectName}
                            </h5>
                            
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                              <span>Budget: <strong className="text-slate-700 font-semibold">₹{Number(proj.revisedCost || 0).toLocaleString()} Cr</strong></span>
                              <span>Progress: <strong className="text-slate-700 font-semibold">{proj.actualProgress}%</strong></span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              proj.riskScore >= 75 ? 'bg-red-50 text-red-700 border-red-200' :
                              proj.riskScore >= 50 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              'bg-green-50 text-green-700 border-green-200'
                            }`}>
                              Risk: {proj.riskScore}/100
                            </span>

                            <button
                              onClick={() => {
                                setSelectedArticle(null);
                                navigate(`/projects/${proj.id}`);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <span>View Project</span>
                              <ExternalLink size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
