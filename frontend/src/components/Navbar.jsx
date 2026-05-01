import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut, Zap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
  ];

  return (
    <nav className="glass-card border-b border-white/10 border-x-0 border-t-0 rounded-none px-6 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white hidden sm:inline">TaskFlow</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${location.pathname.startsWith(to) ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500/30 to-purple-500/30 flex items-center justify-center text-sm font-bold text-brand-300 border border-brand-500/20">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <button onClick={handleLogout} className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
