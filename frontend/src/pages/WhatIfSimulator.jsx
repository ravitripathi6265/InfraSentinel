import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, RefreshCw, GitCompare, ArrowRight } from 'lucide-react';

export default function WhatIfSimulator() {
  const location = useLocation();
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState(location.state?.projectId || 'P-1001');
  const [project, setProject] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulation inputs
  const [simProgress, setSimProgress] = useState(0);
  const [simCost, setSimCost] = useState(0);
  const [simMilestones, setSimMilestones] = useState(0);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data);
      setSimProgress(res.data.actualProgress);
      setSimCost(res.data.revisedCost);
      setSimMilestones(res.data.milestonesDelayed);
      // Run initial simulation to establish baseline
      runSimulation({
        actualProgress: res.data.actualProgress,
        revisedCost: res.data.revisedCost,
        milestonesDelayed: res.data.milestonesDelayed
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async (updates) => {
    try {
      const res = await api.post('/simulate', {
        id: projectId,
        updates
      });
      setScenario(res.data);
    } catch (e) {
      console.error("Simulation failed", e);
    }
  };

  const handleSimulate = () => {
    runSimulation({
      actualProgress: parseFloat(simProgress),
      revisedCost: parseFloat(simCost),
      milestonesDelayed: parseInt(simMilestones, 10)
    });
  };

  if (loading || !project || !scenario) return <div className="p-6">Loading Simulator...</div>;

  const currentRisk = scenario.currentRisk.overallRisk;
  const newRisk = scenario.scenarioRisk.overallRisk;
  const diff = newRisk - currentRisk;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium mb-4"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <GitCompare size={24} className="text-blue-600" /> What-If Risk Simulator
          </h1>
          <p className="text-sm text-slate-500 mt-1">Test how potential changes will impact the indicative risk score of {project.projectName}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Scenario Parameters</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Actual Physical Progress (%)
            </label>
            <input 
              type="range" min="0" max="100" step="1" 
              value={simProgress} 
              onChange={(e) => setSimProgress(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0%</span>
              <span className="font-bold text-slate-700">{simProgress}%</span>
              <span>100%</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Planned: {project.plannedProgress}%</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Revised Cost (₹ Cr)
            </label>
            <input 
              type="number" 
              value={simCost} 
              onChange={(e) => setSimCost(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">Original Cost: ₹{project.originalCost} Cr</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Delayed Milestones
            </label>
            <input 
              type="number" min="0" max="20"
              value={simMilestones} 
              onChange={(e) => setSimMilestones(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button 
            onClick={handleSimulate}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <RefreshCw size={18} /> Run Simulation
          </button>
        </div>

        {/* Results */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner flex flex-col items-center justify-center space-y-8 text-center">
          <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm text-slate-500">Predicted Impact</h3>
          
          <div className="flex items-center justify-center gap-8 w-full">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">Current Risk</p>
              <div className="w-20 h-20 rounded-full border-4 border-slate-300 flex items-center justify-center text-2xl font-bold text-slate-700 bg-white shadow-sm">
                {currentRisk}
              </div>
            </div>

            <ArrowRight size={32} className="text-slate-400" />

            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">Scenario Risk</p>
              <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-bold bg-white shadow-md transition-colors ${
                newRisk >= 75 ? 'border-red-500 text-red-600' :
                newRisk >= 50 ? 'border-orange-500 text-orange-600' :
                'border-green-500 text-green-600'
              }`}>
                {newRisk}
              </div>
            </div>
          </div>

          {diff !== 0 && (
            <div className={`px-4 py-2 rounded-full font-bold text-sm ${diff > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {diff > 0 ? '+' : ''}{diff} Point {diff > 0 ? 'Increase' : 'Decrease'} in Risk Score
            </div>
          )}

          <div className="w-full grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
              <p className="text-xs text-slate-500">Execution Risk</p>
              <p className="text-lg font-bold text-slate-800">{scenario.currentRisk.executionRisk} → {scenario.scenarioRisk.components.executionRisk}</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
              <p className="text-xs text-slate-500">Cost Risk</p>
              <p className="text-lg font-bold text-slate-800">{scenario.currentRisk.costRisk} → {scenario.scenarioRisk.components.costRisk}</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 mt-4 italic">
            *This is an indicative scenario simulation for decision support.
          </p>
        </div>
      </div>
    </div>
  );
}
