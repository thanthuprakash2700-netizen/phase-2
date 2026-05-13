import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MoreVertical, Calendar, User, MessageSquare, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import taskService from '../services/taskService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import TaskModal from '../components/TaskModal';

const COLUMNS = {
  todo: { id: 'todo', title: 'To Do', color: 'bg-slate-400' },
  in_progress: { id: 'in_progress', title: 'In Progress', color: 'bg-primary' },
  review: { id: 'review', title: 'Review', color: 'bg-accent' },
  done: { id: 'done', title: 'Done', color: 'bg-emerald-500' },
};

const Kanban = () => {
  const { user } = useAuth();
  const [boardData, setBoardData] = useState({
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [users, setUsers] = useState([]);

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskService.getKanban();
      setBoardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch kanban board:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      try {
        const response = await api.get('/users/');
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    }
  }, [user?.role]);

  useEffect(() => {
    if (user) {
      fetchBoard();
      fetchUsers();
    }
  }, [fetchBoard, fetchUsers, user]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;
    const taskId = parseInt(draggableId);

    // Optimistic UI update
    const newBoardData = { ...boardData };
    const task = newBoardData[sourceCol].find(t => t.id === taskId);
    if (!task) return;

    newBoardData[sourceCol] = newBoardData[sourceCol].filter(t => t.id !== taskId);
    newBoardData[destCol].splice(destination.index, 0, { ...task, status: destCol });
    setBoardData(newBoardData);

    try {
      await taskService.updateStatus(taskId, destCol);
    } catch (err) {
      console.error('Failed to update task status:', err);
      fetchBoard(); // Revert on error
      alert(err.response?.data?.detail || 'Invalid transition');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(id);
        fetchBoard();
      } catch (err) {
        alert('Failed to delete task');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Kanban Board</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and track your team's workflow</p>
        </div>
        {(user.role === 'admin' || user.role === 'manager') && (
          <button 
            onClick={() => { setEditingTask(null); setShowModal(true); }}
            className="btn btn-primary gradient-primary flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            <span className="font-bold">New Task</span>
          </button>
        )}
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 font-medium"
        >
          <AlertCircle size={20} />
          {error}
        </motion.div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-6 flex-1 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-200">
          {Object.values(COLUMNS).map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80 flex flex-col h-full">
              <div className="flex items-center justify-between mb-5 px-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${column.color} shadow-sm`}></div>
                  <h3 className="font-bold text-slate-700 uppercase tracking-widest text-xs">{column.title}</h3>
                  <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold border border-slate-200/50">
                    {boardData[column.id]?.length || 0}
                  </span>
                </div>
                <MoreVertical size={18} className="text-slate-400 cursor-pointer hover:text-slate-600" />
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-[24px] p-2 transition-all duration-300 ${
                      snapshot.isDraggingOver ? 'bg-slate-100/80 shadow-inner' : 'bg-slate-50/40 border border-dashed border-slate-200/60'
                    }`}
                    style={{ minHeight: '300px' }}
                  >
                    <AnimatePresence mode="popLayout">
                      {boardData[column.id]?.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-4 outline-none ${snapshot.isDragging ? 'z-50' : ''}`}
                            >
                              <TaskCard 
                                task={task} 
                                onEdit={(t) => { setEditingTask(t); setShowModal(true); }}
                                onDelete={handleDelete}
                                canManage={user.role === 'admin' || (user.role === 'manager' && task.created_by_id === user.id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <AnimatePresence>
        {showModal && (
          <TaskModal 
            isOpen={showModal} 
            onClose={() => setShowModal(false)} 
            task={editingTask}
            users={users}
            onSave={() => { setShowModal(false); fetchBoard(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const TaskCard = ({ task, onEdit, onDelete, canManage }) => {
  const priorityColors = {
    low: 'bg-slate-100 text-slate-600 border-slate-200',
    medium: 'bg-amber-50 text-amber-600 border-amber-100',
    high: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group relative cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-lg border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        
        {canManage && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(task)} className="p-1.5 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-lg transition-colors">
              <Edit2 size={14} />
            </button>
            <button onClick={() => onDelete(task.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      
      <h4 className="font-bold text-slate-800 mb-2 leading-tight group-hover:text-primary transition-colors">{task.title}</h4>
      <p className="text-slate-500 text-xs line-clamp-2 mb-5 font-medium leading-relaxed">{task.description}</p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center text-slate-400 gap-1.5">
            <MessageSquare size={14} className="opacity-70" />
            <span className="text-[10px] font-bold">{task.comments?.length || 0}</span>
          </div>
          {task.due_date && (
            <div className="flex items-center text-slate-400 gap-1.5">
              <Calendar size={14} className="opacity-70" />
              <span className="text-[10px] font-bold">
                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex -space-x-2">
          {task.assigned_to_name ? (
            <div 
              className="w-7 h-7 rounded-full gradient-primary border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
              title={task.assigned_to_name}
            >
              {task.assigned_to_name.charAt(0)}
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-300 shadow-sm">
              <User size={14} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Kanban;
