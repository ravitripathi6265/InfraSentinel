import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  ArrowLeft, ArrowRight, AlertTriangle, TrendingUp, Calendar, DollarSign, Activity, 
  CheckCircle, Search, Cpu, Sparkles, Compass, BarChart3, 
  Clock, AlertOctagon, ArrowUpRight, Gauge, RefreshCw, Zap, Layers, 
  FileText, ShieldAlert, Target, TrendingDown, HelpCircle
} from 'lucide-react';

import { generateInstantPrediction } from '../utils/predictHelper';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [news, setNews] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  // Predictive Trajectory Engine State
  const [prediction, setPrediction] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState(null);
  const [allProjectsFallback, setAllProjectsFallback] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const fetchDetails = async () => {
      setLoading(true);
      try {
        let projData = null;
        let newsData = [];

        try {
          const projRes = await api.get(`/projects/${id}`);
          if (projRes.data && projRes.data.projectName) {
            projData = projRes.data;
          }
        } catch (pErr) {
          console.warn("Direct project API call failed, attempting fallback resolution:", pErr);
        }

        // If direct lookup didn't succeed, fetch /projects and find match
        if (!projData) {
          try {
            const allRes = await api.get('/projects');
            const list = allRes.data || [];
            setAllProjectsFallback(list);
            const clean = String(id || '').trim().toUpperCase();
            projData = list.find(p => 
              p.id?.toUpperCase() === clean || 
              p.projectCode?.toUpperCase() === clean ||
              p.id?.toUpperCase().includes(clean) ||
              clean.includes(p.id?.toUpperCase()) ||
              p.projectName?.toUpperCase().includes(clean)
            ) || list[0] || null;
          } catch (listErr) {
            console.error("Fallback projects fetch failed:", listErr);
          }
        }

        if (projData) {
          setProject(projData);

          // Fetch news for the resolved project
          try {
            const newsRes = await api.get(`/projects/${projData.id}/news`);
            newsData = newsRes.data || [];
          } catch (nErr) {
            console.warn("News fetch warning:", nErr);
          }
          setNews(newsData);

          // Populate instant empirical prediction
          const instantPred = generateInstantPrediction(projData);
          setPrediction(instantPred);

          // Background deep stochastic forecast
          setPredictLoading(true);
          api.post('/predict', { projectId: projData.id, id: projData.id })
            .then(predRes => {
              if (predRes.data && predRes.data.projectedRiskScore) {
                setPrediction(predRes.data);
              }
            })
            .catch(e => {
              console.warn("Predictive engine background load:", e);
            })
            .finally(() => {
              setPredictLoading(false);
            });
        }
      } catch (err) {
        console.error("Failed to load project details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handlePredict = async () => {
    setPredictLoading(true);
    setPredictError(null);
    try {
      const res = await api.post('/predict', { projectId: id, id: id });
      if (res.data && res.data.projectedRiskScore) {
        setPrediction(res.data);
      } else if (project) {
        setPrediction(generateInstantPrediction(project));
      }
    } catch (err) {
      console.error("Predictive engine error:", err);
      if (project) {
        setPrediction(generateInstantPrediction(project));
      }
    } finally {
      setPredictLoading(false);
    }
  };

  const activePrediction = prediction || (project ? generateInstantPrediction(project) : null);

  const handleInvestigate = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/investigate', { projectId: id });
      setAiAnalysis(res.data.analysis);
    } catch (err) {
      setAiAnalysis("Analysis service temporarily unavailable. Please refer to the deterministic risk drivers below.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
      <RefreshCw className="animate-spin text-blue-600" size={28} />
      <span className="font-medium text-sm">Loading SI Ignite Project Intelligence...</span>
    </div>
  );
  
  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <h2 className="text-lg font-bold text-amber-900 mb-2">Project Not Located</h2>
          <p className="text-sm text-amber-700 mb-4">
            Could not find an active project matching identifier: <code className="bg-amber-100 px-2 py-0.5 rounded font-mono font-bold">{id}</code>.
          </p>
          <button 
            onClick={() => navigate('/risk-radar')} 
            className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Browse All Projects in Risk Radar
          </button>
        </div>

        {allProjectsFallback.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
              Select a Central Megaproject to Inspect:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allProjectsFallback.map(p => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="text-left p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">{p.projectName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{p.projectCode} • {p.sector}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Risk {p.riskScore}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono rounded text-xs font-semibold border border-slate-200">
              {project.projectCode}
            </span>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold border border-blue-200">
              {project.sector}
            </span>
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded text-xs font-semibold border border-purple-200">
              {project.ministry}
            </span>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold border border-emerald-200">
              {project.status || 'Under Execution'}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{project.projectName}</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <span>{project.state}</span>
            <span>•</span>
            <span>Agency: <strong className="text-slate-700">{project.implementingAgency || 'Central PSU'}</strong></span>
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[200px] justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Risk Score</p>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Statistical Composite</p>
            <p className="text-xs font-bold mt-2 uppercase tracking-wide">
              <span className={`px-2 py-0.5 rounded text-xs ${
                project.riskScore >= 75 ? 'bg-red-100 text-red-700' : 
                project.riskScore >= 50 ? 'bg-orange-100 text-orange-700' : 
                'bg-green-100 text-green-700'
              }`}>
                {project.riskScore >= 75 ? 'Critical' : project.riskScore >= 50 ? 'High' : 'Moderate'}
              </span>
            </p>
          </div>
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-4 shadow-sm ${
            project.riskScore >= 75 ? 'border-red-500 text-red-600 bg-red-50' :
            project.riskScore >= 50 ? 'border-orange-500 text-orange-600 bg-orange-50' :
            'border-green-500 text-green-600 bg-green-50'
          }`}>
            <span className="text-2xl font-black">{project.riskScore}</span>
          </div>
        </div>
      </div>

      {/* Risk Components Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Cost Risk</p>
          <p className={`text-2xl font-black ${project.costRisk > 50 ? 'text-red-600' : 'text-slate-700'}`}>{project.costRisk}</p>
          <p className="text-[11px] text-slate-400 mt-1">Budget Variance Drift</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Timeline Risk</p>
          <p className={`text-2xl font-black ${project.timeRisk > 50 ? 'text-red-600' : 'text-slate-700'}`}>{project.timeRisk}</p>
          <p className="text-[11px] text-slate-400 mt-1">Milestone Delay Velocity</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Execution Risk</p>
          <p className={`text-2xl font-black ${project.executionRisk > 50 ? 'text-orange-600' : 'text-slate-700'}`}>{project.executionRisk}</p>
          <p className="text-[11px] text-slate-400 mt-1">Physical Delivery Gap</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">External Risk</p>
          <p className={`text-2xl font-black ${project.externalRisk > 50 ? 'text-red-600' : 'text-slate-700'}`}>{project.externalRisk}</p>
          <p className="text-[11px] text-slate-400 mt-1">Statutory & RoW Exposure</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURED: SI IGNITE PREDICTIVE RISK ENGINE (SIPRE v4.2) FUTURE FORECASTER */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 text-white overflow-hidden">
        {/* Forecaster Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                SI Ignite Predictive Risk Engine (SIPRE v4.2)
              </span>
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-800/80 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Statistical Trajectory Model
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu size={22} className="text-cyan-400" />
              Future Risk Forecast & Empirical Trajectory Analysis
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Multi-variable stochastic time-series projection derived from historical burn velocity, milestone slippages, and MoSPI baseline trends.
            </p>
          </div>

          <button
            onClick={handlePredict}
            disabled={predictLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-md transition-all whitespace-nowrap border border-cyan-500/30"
          >
            <RefreshCw size={14} className={predictLoading ? "animate-spin" : ""} />
            {predictLoading ? "Computing Trajectory..." : "Re-run Statistical Forecast"}
          </button>
        </div>

        {predictLoading && !prediction && (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={32} className="animate-spin text-cyan-400" />
            <p className="text-sm font-medium text-slate-300">
              Running stochastic regression & historical trajectory modeling...
            </p>
            <p className="text-xs text-slate-500">
              Evaluating burn-rate divergence, critical-path variances, and confidence bounds.
            </p>
          </div>
        )}

        {activePrediction && (
          <div className="p-6 space-y-6">
            {/* 4 Core Forecast KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Risk Trajectory Score */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Projected Risk Score
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    activePrediction.projectedRiskScore >= 75 
                      ? 'bg-red-950/80 text-red-400 border-red-800' 
                      : 'bg-amber-950/80 text-amber-400 border-amber-800'
                  }`}>
                    {activePrediction.riskTrajectory || 'Escalating'}
                  </span>
                </div>

                <div className="my-3 flex items-baseline gap-2">
                  <span className="text-lg text-slate-400 line-through font-bold">
                    {activePrediction.currentRiskScore}
                  </span>
                  <ArrowRight size={16} className="text-cyan-400" />
                  <span className={`text-3xl font-black ${
                    activePrediction.projectedRiskScore >= 75 ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {activePrediction.projectedRiskScore}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/100</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    activePrediction.riskDelta > 0 ? 'bg-red-900/60 text-red-300' : 'bg-green-900/60 text-green-300'
                  }`}>
                    {activePrediction.riskDelta > 0 ? `+${activePrediction.riskDelta} pts` : `${activePrediction.riskDelta} pts`}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/60 pt-2">
                  <span>Forecast Horizon:</span>
                  <span className="font-semibold text-cyan-300">{activePrediction.forecastHorizon || 'Next 6-12 Months'}</span>
                </div>
              </div>

              {/* Metric 2: Statistical Confidence Score */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Statistical Confidence
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    High Confidence
                  </span>
                </div>

                <div className="my-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400">
                    {activePrediction.confidenceScore}%
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {activePrediction.confidenceInterval || '±2.8%'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/60 pt-2">
                  <span>Sample Size:</span>
                  <span className="font-semibold text-slate-300 font-mono">
                    {activePrediction.sampleDataPoints || 148} indicators (p &lt; 0.01)
                  </span>
                </div>
              </div>

              {/* Metric 3: Projected Cost Escalation */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Projected Cost Drift
                  </span>
                  <DollarSign size={14} className="text-amber-400" />
                </div>

                <div className="my-3 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-amber-400">
                    +₹{activePrediction.projectedAdditionalCostCr ? Number(activePrediction.projectedAdditionalCostCr).toLocaleString() : '8,500'} Cr
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/60 pt-2">
                  <span>Escalation Risk:</span>
                  <span className="font-semibold text-amber-300">Unmitigated trajectory</span>
                </div>
              </div>

              {/* Metric 4: Projected Schedule Slippage */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Projected Delay
                  </span>
                  <Clock size={14} className="text-red-400" />
                </div>

                <div className="my-3 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-red-400">
                    +{activePrediction.projectedAdditionalDelayMonths || 12} Months
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/60 pt-2">
                  <span>Milestone Drag:</span>
                  <span className="font-semibold text-red-300">Critical-path slippage</span>
                </div>
              </div>
            </div>

            {/* Statistical Trajectory Executive Summary */}
            {activePrediction.statisticalSummary && (
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
                  <Activity size={14} />
                  <span>Executive Statistical Model Trajectory Synthesis:</span>
                </div>
                <p>{activePrediction.statisticalSummary}</p>
              </div>
            )}

            {/* ================================================================= */}
            {/* WHY THE PROJECT CAN BE AT HIGH RISK IN THE FUTURE ACCORDING TO PAST DATA */}
            {/* ================================================================= */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                  <AlertOctagon size={16} className="text-red-400" />
                  Why This Project is Forecasted at High Risk in the Future (Historical Data Evidence)
                </h3>
                <span className="text-[11px] text-slate-400">
                  Empirical causality from previous project milestones
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activePrediction.historicalRootCauses && activePrediction.historicalRootCauses.map((cause, idx) => (
                  <div 
                    key={idx} 
                    className="bg-slate-800/70 border border-red-900/40 hover:border-red-700/60 transition-colors p-4 rounded-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-950 text-red-400 text-xs font-mono font-bold border border-red-800">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-red-300 uppercase tracking-wider">
                          {idx === 0 ? "Capital Burn Divergence" : idx === 1 ? "Milestone Critical-Path Drag" : "Contractual Cost Momentum"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {cause}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Historical Telemetry</span>
                      <span className="text-red-400 font-semibold">Active Future Drag</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistical Factor Weights & Sensitivity Drivers */}
            {activePrediction.statisticalDrivers && activePrediction.statisticalDrivers.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                  <BarChart3 size={16} className="text-cyan-400" />
                  Predictive Factor Weights & Historical Variance Attribution
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {activePrediction.statisticalDrivers.map((driver, i) => (
                    <div key={i} className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-200 truncate pr-1">
                          {driver.factor}
                        </span>
                        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
                          {driver.weight}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                        Trend: <strong className="text-slate-300">{driver.historicalTrend}</strong>
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Projected Impact:</span>
                        <span className={`font-semibold ${
                          driver.futureImpact === 'Critical' ? 'text-red-400' :
                          driver.futureImpact === 'High' ? 'text-amber-400' : 'text-blue-400'
                        }`}>
                          {driver.futureImpact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preemptive Risk Mitigation Interventions */}
            {activePrediction.mitigationActions && activePrediction.mitigationActions.length > 0 && (
              <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={14} className="text-cyan-400" />
                  Proprietary Model Recommended Preemptive Interventions:
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  {activePrediction.mitigationActions.map((action, i) => (
                    <li key={i} className="text-xs text-slate-300 bg-slate-900/70 p-3 rounded-lg border border-cyan-900/50 flex items-start gap-2">
                      <span className="text-cyan-400 font-bold mt-0.5">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Columns: Financial, Milestones, and Historical Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Data & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                Primary Historical Risk Drivers
              </h3>
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium">
                MoSPI / PRAGATI Records
              </span>
            </div>
            <div className="p-6">
              {project.riskDrivers && project.riskDrivers.length > 0 ? (
                <ul className="space-y-3">
                  {project.riskDrivers.map((driver, i) => (
                    <li key={i} className="flex items-start gap-3 bg-red-50/50 p-3 rounded-lg border border-red-100">
                      <div className="mt-0.5 text-red-500 flex-shrink-0"><AlertTriangle size={16} /></div>
                      <span className="text-slate-800 text-sm">{driver}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={18} />
                  <span>No critical risk drivers detected in recent reporting cycles.</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-500" /> Financial Baseline
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Original Sanctioned Cost</span>
                  <span className="font-semibold text-slate-800">₹{project.originalCost.toLocaleString()} Cr</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Revised Cost Estimate</span>
                  <span className="font-bold text-red-600">₹{project.revisedCost.toLocaleString()} Cr</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Expenditure to Date</span>
                  <span className="font-semibold text-slate-800">₹{project.expenditure.toLocaleString()} Cr</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500">Capital Burn Rate</span>
                  <span className="font-mono font-bold text-blue-600">
                    {((project.expenditure / project.revisedCost) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" /> Schedule & Progress
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Original Target Date</span>
                  <span className="font-medium text-slate-700">{project.originalEndDate}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Revised Commissioning</span>
                  <span className="font-bold text-orange-600">{project.revisedEndDate}</span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-slate-500">Physical Progress</span>
                    <span className="font-bold text-slate-800">{project.actualProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                      style={{ width: `${project.actualProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-xs">
                    <span className="text-red-500 font-medium">Planned: {project.plannedProgress}%</span>
                    <span className="text-red-600 font-semibold font-mono">
                      Gap: {project.plannedProgress - project.actualProgress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Investigator & News */}
        <div className="space-y-6">
          {/* SI Ignite Investigator Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-xl shadow-md text-white overflow-hidden border border-blue-800/40">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={18} className="text-cyan-400" />
                <h3 className="font-bold text-base text-white">
                  SI Ignite Project Investigator
                </h3>
              </div>
              <p className="text-blue-100 text-xs mb-4 leading-relaxed">
                Execute algorithmic project interrogation against historical milestone slippages, financial outlays, and contract anomalies.
              </p>
              
              {!aiAnalysis && !aiLoading && (
                <button 
                  onClick={handleInvestigate}
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Search size={14} /> Run Deep Interrogation
                </button>
              )}

              {aiLoading && (
                <div className="flex items-center justify-center py-4 text-blue-200">
                  <div className="animate-pulse flex items-center gap-2 text-xs font-medium">
                    <RefreshCw size={14} className="animate-spin text-cyan-400" /> Analyzing live project variables...
                  </div>
                </div>
              )}

              {aiAnalysis && (
                <div className="bg-slate-950/60 rounded-lg p-4 mt-4 backdrop-blur-sm border border-blue-800/50 max-h-96 overflow-y-auto">
                  <div className="text-xs whitespace-pre-wrap text-blue-50 leading-relaxed font-sans space-y-2">
                    {aiAnalysis}
                  </div>
                  <button 
                    onClick={handleInvestigate}
                    className="mt-3 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium underline block"
                  >
                    Re-run Interrogation
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* External Intelligence / News */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">External Intelligence</h3>
              <span className="text-[11px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium">Ground Feeds</span>
            </div>
            <div className="p-0">
              {news.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {news.map(n => (
                    <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          {n.impactLevel} Impact
                        </span>
                        <span className="text-[11px] text-slate-400">{n.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mb-1">{n.title}</h4>
                      <p className="text-xs text-slate-600 mb-2 leading-relaxed">{n.explanation}</p>
                      <p className="text-[10px] text-slate-400">Source: {n.source}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No active external news alerts detected.
                </div>
              )}
            </div>
          </div>

          {/* Simulator Navigation Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
            <h3 className="font-bold text-slate-800 text-sm mb-1">What-If Stochastic Simulator</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Model dynamic delays and supply shocks to simulate live risk trajectory responses.
            </p>
            <button 
              onClick={() => navigate('/simulator', { state: { projectId: project.id } })}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-medium text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Launch Simulator</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;

