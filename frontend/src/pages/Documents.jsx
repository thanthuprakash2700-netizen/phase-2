import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FileUp, Download, File as FileIcon, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Documents = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      fetchDocuments(selectedTask);
    } else {
      setDocuments([]);
    }
  }, [selectedTask]);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/');
      setTasks(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDocuments = async (taskId) => {
    try {
      const res = await api.get(`/documents/task/${taskId}`);
      setDocuments(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/documents/upload?task_id=${selectedTask}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFile(null);
      // Reset file input element if needed
      document.querySelector('input[type="file"]').value = '';
      fetchDocuments(selectedTask);
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail || 'Upload failed';
      alert(detail);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.file_name);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Failed to download file. Please check your permissions.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Documents</h1>
        <p className="text-slate-500 font-medium">Manage and version enterprise assets</p>
      </header>

      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 text-lg">Select Task Workspace</h3>
        </div>
        <select 
          className="input w-full max-w-md py-3"
          value={selectedTask}
          onChange={(e) => setSelectedTask(e.target.value)}
        >
          <option value="">-- Choose a Task --</option>
          {tasks.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {selectedTask && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card bg-slate-50">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileUp className="text-primary" size={20} />
                Upload New Document
              </h3>
              <form onSubmit={handleUpload} className="space-y-4">
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                />
                <button 
                  type="submit" 
                  disabled={!file}
                  className="btn btn-primary gradient-primary w-full disabled:opacity-50"
                >
                  Upload & Version
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card h-full">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FileIcon className="text-blue-500" size={20} />
                Task Documents
              </h3>
              
              {documents.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileIcon className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-500 font-medium">No documents uploaded for this task yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map(doc => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={doc.id} 
                      className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-primary/30 hover:bg-slate-50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                          <FileIcon size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{doc.file_name}</h4>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-widest">
                            <span className="bg-slate-200 px-2 py-0.5 rounded-md text-slate-600">v{doc.version}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(doc.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDownload(doc)}
                        className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all shadow-sm"
                      >
                        <Download size={18} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
