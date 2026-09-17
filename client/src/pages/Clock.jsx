import { useState, useEffect } from 'react';
import { clockAPI } from '../api';
import toast from 'react-hot-toast';
import {
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from 'react-icons/hi';

const Clock = () => {
  const [loading, setLoading] = useState(false);
  const [clockResult, setClockResult] = useState(null);
  const [outbox, setOutbox] = useState([]);
  const [outboxLoading, setOutboxLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [customDate, setCustomDate] = useState('');

  useEffect(() => {
    fetchOutbox();
  }, [dateFilter]);

  const fetchOutbox = async () => {
    setOutboxLoading(true);
    try {
      const res = await clockAPI.getOutbox({ date: dateFilter });
      setOutbox(res.data.data.notifications);
    } catch (err) {
      toast.error('Failed to load outbox');
    } finally {
      setOutboxLoading(false);
    }
  };

  const triggerClock = async () => {
    setLoading(true);
    try {
      const payload = customDate ? { date: customDate } : {};
      const res = await clockAPI.trigger(payload);
      setClockResult(res.data.data);
      toast.success(
        `Clock triggered — ${res.data.data.summary.notified} notifications sent`
      );
      // Refresh outbox to show new notifications
      if (customDate) {
        setDateFilter(customDate);
      } else {
        setDateFilter(new Date().toISOString().split('T')[0]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Clock trigger failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HiOutlineClock className="text-orange-500" /> Notification Clock
        </h1>
        <p className="text-sm text-gray-500">
          Trigger daily delivery notifications for eligible customers
        </p>
      </div>

      {/* Trigger Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Trigger Clock
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date (optional — defaults to today)
            </label>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            onClick={triggerClock}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            <HiOutlineBell size={18} />
            {loading ? 'Running...' : 'POST /clock'}
          </button>
        </div>

        {/* Clock Result */}
        {clockResult && (
          <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  clockResult.isWeekday
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {clockResult.isWeekday ? 'Weekday' : 'Weekend'}
              </span>
              <span className="text-sm text-gray-500">{clockResult.date}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-gray-900">
                  {clockResult.summary.total}
                </p>
                <p className="text-xs text-gray-500">Active Customers</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-green-600">
                  {clockResult.summary.notified}
                </p>
                <p className="text-xs text-gray-500">Notified</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-yellow-600">
                  {clockResult.summary.skipped}
                </p>
                <p className="text-xs text-gray-500">Skipped</p>
              </div>
            </div>

            {clockResult.skipped.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Skipped
                </p>
                <div className="space-y-1">
                  {clockResult.skipped.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded border"
                    >
                      <HiOutlineXCircle className="text-yellow-500 shrink-0" />
                      <span className="font-medium">{s.name}</span>
                      <span className="text-gray-400">({s.phone})</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {s.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Outbox Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Notification Outbox
          </h2>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={fetchOutbox}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <HiOutlineRefresh size={18} />
            </button>
          </div>
        </div>

        {outboxLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        ) : outbox.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineBell className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500">
              No notifications for {dateFilter}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Trigger the clock to generate delivery notifications
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-3">
              {outbox.length} notification{outbox.length !== 1 ? 's' : ''} for{' '}
              {dateFilter}
            </p>
            {outbox.map((n) => (
              <div
                key={n._id}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <HiOutlineCheckCircle className="text-green-500 shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {n.customerName}
                  </p>
                  <p className="text-xs text-gray-500">{n.phone}</p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">
                  {new Date(n.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clock;
