import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectById, getTasks, createTask, updateTask, getUsers, addMember, removeMember } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, Plus, X, UserPlus, UserMinus, Search, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const statusColumns = ['To Do', 'In Progress', 'Done'];
const priorityColors = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [search, setSearch] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', priority: 'Medium', assignee: '' });

  // Member modal state
  const [memberEmail, setMemberEmail] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberMessage, setMemberMessage] = useState({ type: '', text: '' });

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [pRes, tRes, uRes] = await Promise.all([
        getProjectById(id),
        getTasks({ projectId: id }),
        getUsers(),
      ]);
      setProject(pRes.data);
      setTasks(tRes.data);
      setUsers(uRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask({ ...taskForm, project: id });
      setTaskForm({ title: '', description: '', dueDate: '', priority: 'Medium', assignee: '' });
      setShowTaskModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleAddMember = async (memberId) => {
    try {
      setMemberLoading(true);
      setMemberMessage({ type: '', text: '' });
      await addMember(id, memberId);
      setMemberMessage({ type: 'success', text: 'Member added successfully!' });
      setMemberEmail('');
      setMemberSearchResults([]);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add member';
      setMemberMessage({ type: 'error', text: msg });
    } finally {
      setMemberLoading(false);
    }
  };

  const handleAddMemberByEmail = async () => {
    if (!memberEmail.trim()) return;
    try {
      setMemberLoading(true);
      setMemberMessage({ type: '', text: '' });
      await addMember(id, null, memberEmail.trim());
      setMemberMessage({ type: 'success', text: 'Member added successfully!' });
      setMemberEmail('');
      setMemberSearchResults([]);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add member';
      setMemberMessage({ type: 'error', text: msg });
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await removeMember(id, memberId);
      setMemberMessage({ type: 'success', text: 'Member removed.' });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove member';
      setMemberMessage({ type: 'error', text: msg });
    }
  };

  // Filter available users (not already members and not the creator)
  const getAvailableUsers = () => {
    if (!project || !users.length) return [];
    const memberIds = project.members?.map(m => m._id) || [];
    return users.filter(u =>
      !memberIds.includes(u._id) &&
      u._id !== project.creator?._id &&
      (memberEmail
        ? u.name.toLowerCase().includes(memberEmail.toLowerCase()) ||
          u.email.toLowerCase().includes(memberEmail.toLowerCase())
        : true)
    );
  };

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!project) return <p className="text-slate-400">Project not found.</p>;

  const isOverdue = (d) => d && new Date(d) < new Date();
  const availableUsers = getAvailableUsers();

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FolderKanban className="w-7 h-7 text-brand-400" /> {project.name}
          </h1>
          <p className="text-slate-400 text-sm mt-1">{project.description || 'No description'}</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'Admin' && (
            <>
              <button onClick={() => { setShowMemberModal(true); setMemberMessage({ type: '', text: '' }); setMemberEmail(''); }} className="btn-secondary flex items-center gap-2 text-sm">
                <UserPlus className="w-4 h-4" /> Members
              </button>
              <button onClick={() => setShowTaskModal(true)} className="btn-primary flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input className="input-field pl-11 text-sm" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusColumns.map((status) => {
          const colTasks = filteredTasks.filter(t => t.status === status);
          const bg = status === 'To Do' ? 'border-slate-500/30' : status === 'In Progress' ? 'border-amber-500/30' : 'border-emerald-500/30';
          return (
            <div key={status} className={`glass-card-light p-4 border-t-2 ${bg}`}>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">{status} ({colTasks.length})</h3>
              <div className="space-y-3 min-h-[100px]">
                {colTasks.map(task => (
                  <div key={task._id} className="glass-card p-4 hover:bg-white/[0.08] transition-all duration-200">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-white">{task.title}</h4>
                      <span className={priorityColors[task.priority]}>{task.priority}</span>
                    </div>
                    {task.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{task.description}</p>}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{task.assignee?.name || 'Unassigned'}</span>
                      {task.dueDate && (
                        <span className={`${isOverdue(task.dueDate) && task.status !== 'Done' ? 'text-red-400' : 'text-slate-500'}`}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {/* Status change buttons */}
                    <div className="flex gap-1.5 mt-3">
                      {statusColumns.filter(s => s !== task.status).map(s => (
                        <button key={s} onClick={() => handleStatusChange(task._id, s)}
                          className="text-xs px-2 py-1 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && <p className="text-xs text-slate-600 text-center py-4">No tasks</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card p-8 w-full max-w-md relative">
            <button onClick={() => setShowTaskModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-white mb-6">Add Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input className="input-field" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
              <textarea className="input-field resize-none h-20" placeholder="Description" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
              <input type="date" className="input-field" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
              <select className="input-field" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
              </select>
              <select className="input-field" value={taskForm.assignee} onChange={e => setTaskForm({...taskForm, assignee: e.target.value})}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card p-8 w-full max-w-lg relative">
            <button onClick={() => setShowMemberModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-white mb-6">Manage Members</h2>

            {/* Status message */}
            {memberMessage.text && (
              <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm ${
                memberMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {memberMessage.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {memberMessage.text}
              </div>
            )}

            {/* Current Members */}
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Current Members ({project.members?.length || 0})</h3>
              {/* Show creator */}
              <div className="flex items-center justify-between glass-card-light p-3">
                <span className="text-sm text-white">
                  {project.creator?.name} <span className="text-slate-500 text-xs">({project.creator?.email})</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300">Owner</span>
                </span>
              </div>
              {project.members?.length > 0 ? project.members.map(m => (
                <div key={m._id} className="flex items-center justify-between glass-card-light p-3">
                  <span className="text-sm text-white">{m.name} <span className="text-slate-500 text-xs">({m.email})</span></span>
                  <button onClick={() => handleRemoveMember(m._id)} className="text-red-400 hover:text-red-300 transition-colors" title="Remove member">
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              )) : <p className="text-xs text-slate-500 pl-1">No additional members yet</p>}
            </div>

            {/* Add Member by Email */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-300">Add Member</h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    className="input-field pl-10 text-sm"
                    placeholder="Search by name or email..."
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddMemberByEmail}
                  disabled={memberLoading || !memberEmail.trim()}
                  className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {memberLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Add
                </button>
              </div>

              {/* Search results / available users */}
              {memberEmail.trim() && (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {availableUsers.length > 0 ? availableUsers.slice(0, 10).map(u => (
                    <div key={u._id} className="flex items-center justify-between glass-card-light p-3 hover:bg-white/[0.06] transition-colors cursor-pointer" onClick={() => handleAddMember(u._id)}>
                      <div>
                        <span className="text-sm text-white">{u.name}</span>
                        <span className="text-slate-500 text-xs ml-2">({u.email})</span>
                      </div>
                      <UserPlus className="w-4 h-4 text-brand-400" />
                    </div>
                  )) : (
                    <p className="text-xs text-slate-500 py-3 text-center">
                      No registered users found matching "{memberEmail}".
                      <br />
                      <span className="text-slate-400">Click "Add" to add by exact email address.</span>
                    </p>
                  )}
                </div>
              )}

              {/* Show all available users when search is empty */}
              {!memberEmail.trim() && availableUsers.length > 0 && (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <p className="text-xs text-slate-500 mb-1">Available users:</p>
                  {availableUsers.slice(0, 10).map(u => (
                    <div key={u._id} className="flex items-center justify-between glass-card-light p-3 hover:bg-white/[0.06] transition-colors cursor-pointer" onClick={() => handleAddMember(u._id)}>
                      <div>
                        <span className="text-sm text-white">{u.name}</span>
                        <span className="text-slate-500 text-xs ml-2">({u.email})</span>
                      </div>
                      <UserPlus className="w-4 h-4 text-brand-400" />
                    </div>
                  ))}
                </div>
              )}

              {!memberEmail.trim() && availableUsers.length === 0 && (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No available users to add. Ask team members to register first, then add them by email.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
