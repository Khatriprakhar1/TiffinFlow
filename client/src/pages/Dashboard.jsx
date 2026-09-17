import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerAPI } from '../api';
import Loading from '../components/Loading';
import { HiOutlineUsers, HiOutlinePlay, HiOutlinePause, HiOutlineCurrencyRupee } from 'react-icons/hi';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="text-xl text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await customerAPI.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your tiffin business</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiOutlineUsers} label="Total Customers" value={stats?.total || 0} color="bg-blue-500" />
        <StatCard icon={HiOutlinePlay} label="Active" value={stats?.active || 0} color="bg-green-500" />
        <StatCard icon={HiOutlinePause} label="Paused" value={stats?.paused || 0} color="bg-yellow-500" />
        <StatCard icon={HiOutlineCurrencyRupee} label="Est. Monthly Revenue" value={`₹${stats?.estimatedRevenue || 0}`} color="bg-orange-500" />
      </div>

      {/* Recent Customers */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Customers</h2>
          <Link to="/customers" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
            View All →
          </Link>
        </div>
        {stats?.recentCustomers?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {stats.recentCustomers.map((c) => (
              <Link
                key={c._id}
                to={`/customers/${c._id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">₹{c.planPrice}/mo</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            No customers yet.{' '}
            <Link to="/customers/new" className="text-orange-500 hover:underline">
              Add your first customer
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
