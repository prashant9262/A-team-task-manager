import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ListTodo, Clock, AlertTriangle, Users,
  TrendingUp, CheckCircle2, Timer
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status) => {
    if (!stats?.tasksByStatus) return 0;
    const found = stats.tasksByStatus.find((s) => s._id === status);
    return found ? found.count : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats?.totalTasks || 0,
      icon: ListTodo,
      gradient: 'from-brand-500 to-blue-600',
      shadow: 'shadow-brand-500/20',
    },
    {
      label: 'To Do',
      value: getStatusCount('To Do'),
      icon: Clock,
      gradient: 'from-slate-400 to-slate-600',
      shadow: 'shadow-slate-500/20',
    },
    {
      label: 'In Progress',
      value: getStatusCount('In Progress'),
      icon: Timer,
      gradient: 'from-amber-400 to-orange-600',
      shadow: 'shadow-amber-500/20',
    },
    {
      label: 'Done',
      value: getStatusCount('Done'),
      icon: CheckCircle2,
      gradient: 'from-emerald-400 to-green-600',
      shadow: 'shadow-emerald-500/20',
    },
    {
      label: 'Overdue',
      value: stats?.overdueTasks || 0,
      icon: AlertTriangle,
      gradient: 'from-red-400 to-rose-600',
      shadow: 'shadow-red-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-brand-400" />
          Dashboard
        </h1>
        <p className="text-slate-400 mt-1">
          Welcome back, <span className="text-brand-400 font-medium">{user?.name}</span>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`glass-card p-5 hover:scale-[1.02] transition-transform duration-300 ${card.shadow} shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-slate-400 text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Tasks Per User (Admin only) */}
      {user?.role === 'Admin' && stats?.tasksPerUser?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-5">
            <Users className="w-5 h-5 text-brand-400" />
            Tasks Per Team Member
          </h2>
          <div className="space-y-3">
            {stats.tasksPerUser.map((item, idx) => {
              const maxCount = Math.max(...stats.tasksPerUser.map((i) => i.count));
              const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-slate-300 truncate">{item.name}</div>
                  <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm font-semibold text-white w-8 text-right">{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Tip */}
      <div className="glass-card-light p-5 flex items-start gap-4">
        <TrendingUp className="w-5 h-5 text-brand-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-slate-300">
            {user?.role === 'Admin'
              ? 'As an Admin, you can create projects, manage members, and assign tasks to your team.'
              : 'You can view and update the status of tasks assigned to you.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
