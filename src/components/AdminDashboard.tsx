import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchListings } from '../lib/api';
import { Listing } from '../types';
import { UserProfileSection } from './UserProfileSection';
import { INITIAL_UNIVERSITIES } from '../data/mockData';
import { 
  ShieldCheck, AlertTriangle, Users, Building2, GraduationCap, CheckCircle, 
  XCircle, Ban, Eye, RefreshCw, FileText, Lock, ShieldAlert, CheckCircle2,
  Plus, Search, Filter, Activity, Server, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const { addToast } = useAuth();

  const [activeTab, setActiveTab] = useState<'moderation' | 'agent_verification' | 'disputes' | 'institutions' | 'audit_logs' | 'profile'>('moderation');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Agent Verification Requests Queue
  const [pendingAgents, setPendingAgents] = useState([
    { id: 'ag_p1', name: 'Alaba Student Housing Ltd', email: 'alaba@housing.ng', uni: 'University of Lagos (UNILAG)', docType: 'NIN-84920491823', status: 'pending' },
    { id: 'ag_p2', name: 'Ile-Ife Campus Properties', email: 'oau@properties.ng', uni: 'Obafemi Awolowo University (OAU)', docType: 'CAC-RC892019', status: 'pending' },
    { id: 'ag_p3', name: 'Yabatech Hostels Consult', email: 'yaba@hostels.ng', uni: 'Yaba College of Technology', docType: 'NIN-99102837482', status: 'pending' },
  ]);

  // Security Fraud Reports Queue
  const [reports, setReports] = useState([
    { id: 'rep_01', listingTitle: 'Subsea Luxury Student Suites', reason: 'Unresponsive Agent Asking for Fee Before Viewing', reporter: 'Chidi O. (UNILAG)', status: 'open', date: '10 mins ago' },
    { id: 'rep_02', listingTitle: 'Silverline Deluxe Self-Contain', reason: 'Photos do not match actual room condition', reporter: 'Amina B. (ABU Zaria)', status: 'open', date: '1 hour ago' },
  ]);

  // Institution List State
  const [universitiesList, setUniversitiesList] = useState(INITIAL_UNIVERSITIES);
  const [newUniName, setNewUniName] = useState('');
  const [newUniShort, setNewUniShort] = useState('');
  const [newUniState, setNewUniState] = useState('Lagos');
  const [newUniType, setNewUniType] = useState<'University' | 'Polytechnic' | 'College of Education'>('University');
  const [isAddingUni, setIsAddingUni] = useState(false);

  useEffect(() => {
    fetchListings({})
      .then(data => setListings(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApproveListing = (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'active', isAgentVerified: true } : l));
    addToast('Listing Approved', 'Hostel accommodation approved for public discovery.', 'success');
  };

  const handleFlagListing = (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'flagged' } : l));
    addToast('Listing Suspended', 'Property flagged and hidden from search.', 'warning');
  };

  const handleApproveAgent = (id: string) => {
    setPendingAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    addToast('Agent Gold Badge Granted', 'Verification badge issued to agent account.', 'success');
  };

  const handleRejectAgent = (id: string) => {
    setPendingAgents(prev => prev.filter(a => a.id !== id));
    addToast('Agent Request Declined', 'Agent verification declined.', 'info');
  };

  const handleResolveReport = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
    addToast('Report Resolved', 'Fraud report marked as resolved.', 'success');
  };

  const handleAddInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniName || !newUniShort) {
      addToast('Missing Info', 'Please enter institution name and acronym', 'warning');
      return;
    }

    const newInst = {
      id: `uni_${Date.now()}`,
      name: newUniName,
      shortName: newUniShort,
      country: 'Nigeria',
      state: newUniState,
      city: newUniState,
      institutionType: newUniType,
      ownership: 'Federal' as any,
      campuses: ['Main Campus'],
      coordinates: { lat: 6.5244, lng: 3.3792 },
      studentCount: '25,000+',
      totalListings: 1,
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    };

    setUniversitiesList(prev => [newInst, ...prev]);
    setIsAddingUni(false);
    setNewUniName('');
    setNewUniShort('');
    addToast('Institution Added', `${newUniName} added to Campora tertiary network.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Executive Admin Header - Purple Governance Vibe */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-purple-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-purple-600 text-white font-black shadow-lg shadow-purple-600/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-extrabold border border-purple-500/30 mb-1">
              <Lock className="w-3.5 h-3.5" /> Platform Governance Console
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold">Campora Trust & Safety Command</h1>
            <p className="text-xs text-slate-300 mt-0.5">Moderating student hostels and agent verification across 36 Nigerian states</p>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-center">
            <span className="block text-[11px] text-slate-400 font-semibold">Flagged Reports</span>
            <span className="text-xl font-black text-rose-400">{reports.filter(r => r.status === 'open').length}</span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-center">
            <span className="block text-[11px] text-slate-400 font-semibold">Pending Agents</span>
            <span className="text-xl font-black text-amber-400">{pendingAgents.filter(a => a.status === 'pending').length}</span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-center">
            <span className="block text-[11px] text-slate-400 font-semibold">Active Campuses</span>
            <span className="text-xl font-black text-purple-400">{universitiesList.length}</span>
          </div>
        </div>
      </div>

      {/* Admin Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'moderation'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Listing Moderation ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('agent_verification')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'agent_verification'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Agent Verification Queue ({pendingAgents.filter(a => a.status === 'pending').length})
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'disputes'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          Fraud Reports & Disputes ({reports.filter(r => r.status === 'open').length})
        </button>

        <button
          onClick={() => setActiveTab('institutions')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'institutions'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Campus Network ({universitiesList.length})
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'audit_logs'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Security Audit Logs
        </button>

        <button
          onClick={() => setActiveTab('profile' as any)}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
            (activeTab as string) === 'profile'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Admin Profile & Accounts
        </button>
      </div>

      {/* Tab 1: Listing Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
              Hostel Property Moderation Audit
            </h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] text-slate-400">
                <tr>
                  <th className="p-4">Property Title</th>
                  <th className="p-4">Target Campus</th>
                  <th className="p-4">Agent Name</th>
                  <th className="p-4">Annual Rent</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {listings.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{l.title}</td>
                    <td className="p-4 text-slate-500 font-medium">{l.universityName}</td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{l.agentName}</td>
                    <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">
                      ₦{new Intl.NumberFormat().format(l.price)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        l.status === 'flagged'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleApproveListing(l.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700"
                      >
                        Approve Live
                      </button>
                      <button
                        onClick={() => handleFlagListing(l.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[11px] font-bold hover:bg-rose-200"
                      >
                        Flag / Takedown
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Agent Verification Requests */}
      {activeTab === 'agent_verification' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
              Pending Agent Gold Badge Approvals
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingAgents.map(ag => (
              <div
                key={ag.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{ag.name}</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    ag.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ag.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs space-y-1">
                  <p className="text-slate-600 dark:text-slate-300"><strong>Email:</strong> {ag.email}</p>
                  <p className="text-slate-600 dark:text-slate-300"><strong>Primary Campus:</strong> {ag.uni}</p>
                  <p className="text-purple-600 dark:text-purple-400 font-bold"><strong>ID Document:</strong> {ag.docType}</p>
                </div>

                {ag.status === 'pending' ? (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleRejectAgent(ag.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleApproveAgent(ag.id)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Grant Gold Badge
                    </button>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Verified Gold Agent
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Fraud Reports */}
      {activeTab === 'disputes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
              Student Safety Reports & Fraud Investigations
            </h3>
          </div>

          <div className="space-y-4">
            {reports.map(rep => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-black uppercase">
                      ● Report {rep.status}
                    </span>
                    <span className="text-[10px] text-slate-400">{rep.date}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{rep.listingTitle}</h4>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Reason: {rep.reason}</p>
                  <p className="text-[11px] text-slate-500">Reported by: {rep.reporter}</p>
                </div>

                {rep.status === 'open' && (
                  <button
                    onClick={() => handleResolveReport(rep.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shrink-0"
                  >
                    Resolve & Warn Agent
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Campus Network Directory */}
      {activeTab === 'institutions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
              Tertiary Higher Education Institutions ({universitiesList.length})
            </h3>
            <button
              onClick={() => setIsAddingUni(!isAddingUni)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New Institution
            </button>
          </div>

          {/* Add Institution Form */}
          <AnimatePresence>
            {isAddingUni && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddInstitution}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-4"
              >
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Add Higher Institution</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Full Institution Name</label>
                    <input
                      type="text"
                      value={newUniName}
                      onChange={e => setNewUniName(e.target.value)}
                      placeholder="e.g. Lagos State University"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Acronym / Short Name</label>
                    <input
                      type="text"
                      value={newUniShort}
                      onChange={e => setNewUniShort(e.target.value)}
                      placeholder="e.g. LASU"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Nigerian State</label>
                    <input
                      type="text"
                      value={newUniState}
                      onChange={e => setNewUniState(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Type</label>
                    <select
                      value={newUniType}
                      onChange={e => setNewUniType(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100"
                    >
                      <option value="University">University</option>
                      <option value="Polytechnic">Polytechnic</option>
                      <option value="College of Education">College of Education</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingUni(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700"
                  >
                    Save Institution
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {universitiesList.map(u => (
              <div
                key={u.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between"
              >
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{u.name}</h4>
                  <p className="text-[10px] text-slate-500">{u.state} State • {u.category || u.institutionType}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  {u.shortName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Security Audit Logs */}
      {activeTab === 'audit_logs' && (
        <div className="bg-slate-900 text-slate-200 p-6 rounded-3xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-emerald-400 font-bold flex items-center gap-2">
              <Activity className="w-4 h-4" /> Live Campora Audit Log Stream
            </span>
            <span className="text-[10px] text-slate-500">Node: Clustered-Cloud-01</span>
          </div>
          <div className="space-y-2 text-[11px] leading-relaxed">
            <p><span className="text-slate-500">[2026-08-04 12:10:04]</span> <span className="text-emerald-400">INFO</span> Agent verification submitted for 'Prime Student Residences Ltd'.</p>
            <p><span className="text-slate-500">[2026-08-04 12:08:22]</span> <span className="text-purple-400">AUTH</span> Student account logged in via UNILAG Akoka portal.</p>
            <p><span className="text-slate-500">[2026-08-04 12:01:15]</span> <span className="text-amber-400">WARN</span> Security scanner validated 24/7 power badge for listing #subsea_01.</p>
            <p><span className="text-slate-500">[2026-08-04 11:45:00]</span> <span className="text-emerald-400">INFO</span> New roommate matching post generated for UNILAG Computer Science student.</p>
          </div>
        </div>
      )}

      {/* Tab 6: Admin Profile & Accounts Section */}
      {activeTab === 'profile' && (
        <UserProfileSection />
      )}

    </div>
  );
};
