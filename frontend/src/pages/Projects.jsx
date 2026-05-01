import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, Plus, Users, Calendar, X } from 'lucide-react';

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createProject(form);
      setForm({ name: '', description: '' });
      setShowModal(false);
      fetchProjects();
    } catch (err) { console.error(err); }
    finally { setCreating(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-brand-400" />
            Projects
          </h1>
          <p className="text-slate-400 mt-1">Manage your team projects</p>
        </div>
        {user?.role === 'Admin' && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No projects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project._id} onClick={() => navigate(`/projects/${project._id}`)}
              className="glass-card p-6 cursor-pointer hover:bg-white/[0.08] hover:scale-[1.01] transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-3">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-brand-300 transition-colors">{project.name}</h3>
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">{project.description || 'No description'}</p>
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{project.members?.length || 0} members</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card p-8 w-full max-w-md relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-white mb-6">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                <input type="text" className="input-field" placeholder="My Project" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea className="input-field resize-none h-24" placeholder="What's this project about?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary disabled:opacity-50">{creating ? 'Creating...' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
