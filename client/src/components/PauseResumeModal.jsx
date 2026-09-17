import { useState } from 'react';
import { HiOutlineX } from 'react-icons/hi';

const PauseResumeModal = ({ customer, action, onConfirm, onClose, loading }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = () => {
    onConfirm(date);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {action === 'pause' ? 'Pause Subscription' : 'Resume Subscription'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <HiOutlineX size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {action === 'pause'
            ? `Pause subscription for ${customer.name}? They will not be charged for weekdays during the pause.`
            : `Resume subscription for ${customer.name}? Billing will restart from this date.`}
        </p>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {action === 'pause' ? 'Pause From' : 'Resume From'}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${
              action === 'pause'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {loading ? 'Processing...' : action === 'pause' ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PauseResumeModal;
