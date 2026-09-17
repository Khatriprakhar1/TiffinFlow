import { useState, useEffect } from 'react';
import { transferAPI, customerAPI } from '../api';
import toast from 'react-hot-toast';
import {
  HiOutlineSwitchHorizontal,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineCurrencyRupee,
} from 'react-icons/hi';

const Transfers = () => {
  const [customers, setCustomers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(true);

  const [form, setForm] = useState({
    fromCustomerId: '',
    toCustomerId: '',
    transferDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Split bill state
  const [splitBill, setSplitBill] = useState(null);
  const [splitCustomerId, setSplitCustomerId] = useState('');
  const [splitMonth, setSplitMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );

  useEffect(() => {
    fetchCustomers();
    fetchLogs();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await customerAPI.getAll({ limit: 100 });
      setCustomers(res.data.data);
    } catch (err) {
      toast.error('Failed to load customers');
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await transferAPI.getLogs();
      setLogs(res.data.data);
    } catch (err) {
      toast.error('Failed to load transfer logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!form.fromCustomerId || !form.toCustomerId || !form.transferDate) {
      toast.error('Select both customers and a transfer date');
      return;
    }
    if (form.fromCustomerId === form.toCustomerId) {
      toast.error('Cannot transfer to the same customer');
      return;
    }

    setLoading(true);
    try {
      const res = await transferAPI.transfer(form);
      toast.success(res.data.message);
      setForm({ fromCustomerId: '', toCustomerId: '', transferDate: new Date().toISOString().split('T')[0], notes: '' });
      fetchLogs();
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchSplitBill = async () => {
    if (!splitCustomerId || !splitMonth) {
      toast.error('Select a customer and month');
      return;
    }
    try {
      const res = await transferAPI.getSplitBill(splitCustomerId, splitMonth);
      setSplitBill(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch split bill');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HiOutlineSwitchHorizontal className="text-orange-500" /> Subscription Transfers
        </h1>
        <p className="text-sm text-gray-500">Transfer subscriptions between customers mid-cycle</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">New Transfer</h2>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Customer</label>
              <select
                value={form.fromCustomerId}
                onChange={(e) => setForm({ ...form, fromCustomerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select source customer...</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <HiOutlineArrowRight className="text-gray-400" size={24} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Customer</label>
              <select
                value={form.toCustomerId}
                onChange={(e) => setForm({ ...form, toCustomerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select target customer...</option>
                {customers
                  .filter(c => c._id !== form.fromCustomerId)
                  .map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Date</label>
              <input
                type="date"
                value={form.transferDate}
                onChange={(e) => setForm({ ...form, transferDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Reason for transfer..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Transferring...' : 'Transfer Subscription'}
            </button>
          </form>
        </div>

        {/* Split Bill Calculator */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Split Bill Preview</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                value={splitCustomerId}
                onChange={(e) => setSplitCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select customer...</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="month"
                value={splitMonth}
                onChange={(e) => setSplitMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={fetchSplitBill}
              className="w-full py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Calculate Split Bill
            </button>

            {splitBill && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  {splitBill.customer.name} — {splitBill.billing.activeRange.from} to {splitBill.billing.activeRange.to}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Total Weekdays</p>
                    <p className="font-semibold">{splitBill.billing.totalWeekdays}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Active Weekdays</p>
                    <p className="font-semibold">{splitBill.billing.activeWeekdays}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Paused Days</p>
                    <p className="font-semibold">{splitBill.billing.pausedWeekdays}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Billable Days</p>
                    <p className="font-semibold text-green-600">{splitBill.billing.billableDays}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Daily Rate</p>
                    <p className="font-semibold">₹{splitBill.billing.dailyRate}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Final Bill</p>
                    <p className="font-bold text-lg text-orange-600">₹{splitBill.billing.finalBill}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Logs */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Transfer History</h2>
        {logsLoading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineSwitchHorizontal className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500">No transfers yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">From</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">To</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Plan</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">
                      <div className="flex items-center gap-1.5">
                        <HiOutlineCalendar className="text-gray-400" size={14} />
                        {new Date(log.transferDate).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{log.fromCustomerId?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{log.fromCustomerId?.phone || ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{log.toCustomerId?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{log.toCustomerId?.phone || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.planId?.name || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      <div className="flex items-center justify-end gap-1">
                        <HiOutlineCurrencyRupee size={14} />
                        {log.monthlyPrice}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{log.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transfers;
