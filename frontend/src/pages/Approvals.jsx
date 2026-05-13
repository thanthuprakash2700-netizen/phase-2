import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, Plus, 
  Search, Filter, ChevronRight, MessageSquare, 
  User, History, AlertCircle
} from 'lucide-react';
import approvalService from '../services/approvalService';
import { motion, AnimatePresence } from 'framer-motion';
import ApprovalModal from '../components/ApprovalModal';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, type: '', comment: '' });
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await approvalService.getApprovals();
      setApprovals(response.data);
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (actionModal.type === 'rejected' && !actionModal.comment) {
      alert('Rejection requires a comment');
      return;
    }

    try {
      await approvalService.takeAction(selectedApproval.id, actionModal.type, actionModal.comment);
      setActionModal({ open: false, type: '', comment: '' });
      setSelectedApproval(null);
      fetchApprovals();
    } catch (err) {
      console.error('Failed to take action:', err);
      alert(err.response?.data?.detail || 'Action failed');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-600';
      case 'rejected': return 'bg-red-100 text-red-600';
      case 'hold': return 'bg-amber-100 text-amber-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="h-full flex gap-8">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Approvals</h1>
            <p className="text-slate-500 font-medium mt-1">Manage workflow requests and audits</p>
          </div>
          {currentUser?.role === 'employee' && (
            <button 
              onClick={() => setRequestModalOpen(true)}
              className="btn btn-primary gradient-primary flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Plus size={20} />
              <span className="font-bold">Request Approval</span>
            </button>
          )}
        </div>

        <div className="card p-0 overflow-hidden flex flex-col flex-1 border-slate-100">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search requests..." className="input pl-10 h-11 text-sm bg-white" />
            </div>
            <button className="btn btn-secondary flex items-center gap-2 text-sm px-5 border-slate-200">
              <Filter size={16} />
              Filter
            </button>
          </div>

          <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
            {approvals.length > 0 ? (
              approvals.map((approval) => (
                <div
                  key={approval.id}
                  onClick={() => setSelectedApproval(approval)}
                  className={`p-6 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 flex items-center gap-5 ${
                    selectedApproval?.id === approval.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <div className={`p-3.5 rounded-2xl shadow-sm ${getStatusStyle(approval.status)}`}>
                    {approval.status === 'approved' ? <CheckCircle size={22} /> : 
                     approval.status === 'rejected' ? <XCircle size={22} /> : <Clock size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate text-lg leading-tight mb-1">{approval.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><User size={14} className="opacity-70" /> {approval.requester_name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} className="opacity-70" /> {new Date(approval.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border ${getStatusStyle(approval.status)}`}>
                      {approval.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Level: {approval.current_level}</div>
                  </div>
                  <ChevronRight className="text-slate-300" size={24} />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                <AlertCircle size={48} className="mb-4 opacity-20" />
                <p className="font-medium">No approval requests found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-[450px] flex flex-col">
        <AnimatePresence mode="wait">
          {selectedApproval ? (
            <motion.div
              key={selectedApproval.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="card flex flex-col h-full overflow-hidden border-slate-100 shadow-xl shadow-slate-200/50"
            >
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <div className="flex justify-between items-start mb-6">
                  <span className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg border ${getStatusStyle(selectedApproval.status)}`}>
                    {selectedApproval.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">ID: #{selectedApproval.id}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-4">{selectedApproval.title}</h2>
                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">{selectedApproval.description}</p>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col overflow-hidden">
                {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && selectedApproval.status === 'pending' && (
                  <div className="flex gap-4 mb-8">
                    <button 
                      onClick={() => setActionModal({ open: true, type: 'approved', comment: '' })}
                      className="flex-1 gradient-primary hover:opacity-90 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} /> Approve
                    </button>
                    <button 
                      onClick={() => setActionModal({ open: true, type: 'rejected', comment: '' })}
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-100">
                  <div className="flex items-center gap-3 text-slate-900 font-bold mb-6 sticky top-0 bg-white py-2 z-10">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <History size={18} className="text-primary" />
                    </div>
                    <span className="text-sm uppercase tracking-widest">Audit Trail</span>
                  </div>
                  
                  <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {selectedApproval.history?.length > 0 ? (
                      selectedApproval.history.map((h, i) => (
                        <div key={i} className="relative pl-10">
                          <div className={`absolute left-0.5 top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                            h.action === 'approved' ? 'bg-emerald-500' : h.action === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                          }`}></div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-slate-800">{h.actor_name}</span>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{new Date(h.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className={`text-[10px] uppercase font-bold tracking-widest ${
                            h.action === 'approved' ? 'text-emerald-600' : h.action === 'rejected' ? 'text-rose-600' : 'text-amber-600'
                          }`}>{h.action}</div>
                          {h.comment && (
                            <div className="mt-3 p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 font-medium italic border border-slate-100 relative before:absolute before:-top-2 before:left-4 before:w-4 before:h-4 before:bg-slate-50 before:rotate-45 before:border-l before:border-t before:border-slate-100">
                              "{h.comment}"
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 px-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <Clock size={32} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No actions taken yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="card flex-1 flex flex-col items-center justify-center text-slate-400 text-center p-12 border-slate-100 bg-slate-50/20 border-dashed">
              <div className="w-20 h-20 bg-white shadow-xl shadow-slate-200/50 rounded-[32px] flex items-center justify-center mb-6">
                <Clock size={36} className="text-primary/40" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">No Request Selected</h3>
              <p className="text-sm mt-3 text-slate-500 font-medium leading-relaxed">Select an approval request from the list to view its complete audit trail and details.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {actionModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-10 w-full max-w-md shadow-2xl relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-full h-2 ${actionModal.type === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <h3 className="text-2xl font-bold text-slate-900 mb-2 capitalize">
              {actionModal.type} Request
            </h3>
            <p className="text-slate-500 text-sm mb-8 font-medium">
              {actionModal.type === 'rejected' ? 'Please provide a formal reason for rejecting this request.' : 'You may add an optional comment for this approval.'}
            </p>
            
            <textarea
              className="input min-h-[120px] mb-8 py-4 px-5 text-sm"
              placeholder="Enter your comments here..."
              value={actionModal.comment}
              onChange={(e) => setActionModal({ ...actionModal, comment: e.target.value })}
            ></textarea>

            <div className="flex gap-4">
              <button 
                className="btn btn-secondary flex-1 py-4 font-bold rounded-2xl"
                onClick={() => setActionModal({ open: false, type: '', comment: '' })}
              >
                Cancel
              </button>
              <button 
                className={`btn flex-1 text-white font-bold py-4 rounded-2xl shadow-lg transition-all ${
                  actionModal.type === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                }`}
                onClick={handleAction}
              >
                Confirm {actionModal.type}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {requestModalOpen && (
          <ApprovalModal 
            isOpen={requestModalOpen}
            onClose={() => setRequestModalOpen(false)}
            onSave={() => {
              setRequestModalOpen(false);
              fetchApprovals();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Approvals;
