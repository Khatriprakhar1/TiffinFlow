import { useState } from 'react';
import { importAPI } from '../api';
import toast from 'react-hot-toast';
import {
  HiOutlineUpload,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineDuplicate,
  HiOutlineDocumentText,
} from 'react-icons/hi';

const SAMPLE_DATA = JSON.stringify([
  { name: "Rahul Sharma", phone: "+91 98765 43210", address: "12 MG Road, Pune", planPrice: 3000, planStartDate: "15/09/2026" },
  { name: "  Priya   Patel ", phone: "987-654-3210", address: "45 FC Road, Pune", planPrice: 3500, planStartDate: "2026-09-01" },
  { name: "Amit Kumar", phone: "9123456789", address: "78 JM Road, Pune", planPrice: 2500, planStartDate: "01 Sep 2026" },
  { name: "", phone: "1234", address: "", planPrice: -100, planStartDate: "invalid-date" },
  { name: "Sneha Desai", phone: "09876543210", address: "22 Baner Road, Pune", planPrice: 3000, planStartDate: "15-September-2026" },
  { name: "Rahul Duplicate", phone: "+919876543210", address: "99 Other Street", planPrice: 3000, planStartDate: "2026-09-10" }
], null, 2);

const Import = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState('imported');

  const handleImport = async () => {
    if (!input.trim()) {
      toast.error('Paste customer data first');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(input);
    } catch (err) {
      toast.error('Invalid JSON. Check your data format.');
      return;
    }

    if (!Array.isArray(parsed)) {
      toast.error('Data must be a JSON array');
      return;
    }

    setLoading(true);
    try {
      const res = await importAPI.importCustomers({ customers: parsed });
      setReport(res.data.data);
      toast.success(
        `Import done: ${res.data.data.summary.importedCount} imported, ${res.data.data.summary.dedupedCount} deduped, ${res.data.data.summary.rejectedCount} rejected`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setInput(SAMPLE_DATA);
    toast.success('Sample data loaded — includes duplicates and bad records');
  };

  const tabConfig = [
    { key: 'imported', label: 'Imported', icon: HiOutlineCheck, color: 'green' },
    { key: 'deduped', label: 'Deduped', icon: HiOutlineDuplicate, color: 'yellow' },
    { key: 'rejected', label: 'Rejected', icon: HiOutlineX, color: 'red' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HiOutlineUpload className="text-orange-500" /> Import Customers
        </h1>
        <p className="text-sm text-gray-500">
          Bulk import messy customer data — phones, dates, and names are auto-normalized
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Customer Data (JSON)</h2>
          <button
            onClick={loadSample}
            className="text-sm text-orange-500 hover:underline font-medium"
          >
            Load Sample Data
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder='[{"name": "John", "phone": "+91 9876543210", "address": "...", "planPrice": 3000, "planStartDate": "15/09/2026"}]'
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-400">
            Supported date formats: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, DD Mon YYYY
          </p>
          <button
            onClick={handleImport}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            <HiOutlineUpload size={18} />
            {loading ? 'Importing...' : 'Import Customers'}
          </button>
        </div>
      </div>

      {/* Report Section */}
      {report && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg border">
              <p className="text-2xl font-bold text-gray-900">{report.summary.total}</p>
              <p className="text-xs text-gray-500">Total Rows</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-600">{report.summary.importedCount}</p>
              <p className="text-xs text-green-600">Imported</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-2xl font-bold text-yellow-600">{report.summary.dedupedCount}</p>
              <p className="text-xs text-yellow-600">Deduped</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-2xl font-bold text-red-600">{report.summary.rejectedCount}</p>
              <p className="text-xs text-red-600">Rejected</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 mb-4">
            {tabConfig.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? `border-${color}-500 text-${color}-700`
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {label} ({report[key]?.length || 0})
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'imported' && (
            <div className="space-y-2">
              {report.imported.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No records imported</p>
              ) : (
                report.imported.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg border border-green-100">
                    <HiOutlineCheck className="text-green-500 shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Row {r.row}: {r.name}</p>
                      <p className="text-xs text-gray-500">{r.phone} — ₹{r.planPrice} — Start: {r.planStartDate}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'deduped' && (
            <div className="space-y-2">
              {report.deduped.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No duplicates found</p>
              ) : (
                report.deduped.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <HiOutlineDuplicate className="text-yellow-500 shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Row {r.row}: {r.original?.name || '(no name)'}</p>
                      <p className="text-xs text-gray-500">Phone: {r.normalizedPhone} — {r.reason}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'rejected' && (
            <div className="space-y-2">
              {report.rejected.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No records rejected</p>
              ) : (
                report.rejected.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 bg-red-50 rounded-lg border border-red-100">
                    <HiOutlineX className="text-red-500 shrink-0 mt-0.5" size={18} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Row {r.row}: {r.original?.name || '(empty)'}</p>
                      <ul className="mt-1 space-y-0.5">
                        {r.reasons.map((reason, j) => (
                          <li key={j} className="text-xs text-red-600">• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Import;
