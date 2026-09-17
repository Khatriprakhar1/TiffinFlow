import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { customerAPI, subscriptionAPI } from '../api';
import BillCard from '../components/BillCard';
import PauseResumeModal from '../components/PauseResumeModal';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePause,
  HiOutlinePlay,
  HiOutlineArrowLeft,
} from 'react-icons/hi';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billLoading, setBillLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Default to current month
  const now = new Date();
  const [billMonth, setBillMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, subRes] = await Promise.all([
        customerAPI.getOne(id),
        subscriptionAPI.get(id).catch(() => null),
      ]);
      setCustomer(custRes.data.data);
      if (subRes) setSubscription(subRes.data.data);
    } catch (err) {
      toast.error('Failed to load customer details');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchBill = async () => {
    if (!billMonth) return;
    setBillLoading(true);
    try {
      const res = await subscriptionAPI.getBill(id, billMonth);
      setBill(res.data.data.billing);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    } finally {
      setBillLoading(false);
    }
  };

  useEffect(() => {
    if (subscription) {
      fetchBill();
    }
  }, [subscription, billMonth]);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await customerAPI.delete(id);
      toast.success('Customer deleted');
      setShowDeleteConfirm(false);
      navigate('/customers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePauseResume = async (date) => {
    setActionLoading(true);
    try {
      if (modal.action === 'pause') {
        await subscriptionAPI.pause(id, { startDate: date });
        toast.success('Subscription paused');
      } else {
        await subscriptionAPI.resume(id, { endDate: date });
        toast.success('Subscription resumed');
      }
      setModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!customer) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link to="/customers" className="p-2 rounded-lg hover:bg-gray-200 text-gray-500">
            <HiOutlineArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-sm text-gray-500">{customer.phone}</p>
          </div>
          <span
            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              customer.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {customer.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {customer.status === 'active' ? (
            <button
              onClick={() => setModal({ action: 'pause' })}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <HiOutlinePause size={16} /> Pause
            </button>
          ) : (
            <button
              onClick={() => setModal({ action: 'resume' })}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <HiOutlinePlay size={16} /> Resume
            </button>
          )}
          <Link
            to={`/customers/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HiOutlinePencil size={16} /> Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <HiOutlineTrash size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Name</span>
              <span className="font-medium text-gray-800">{customer.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium text-gray-800">{customer.phone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Address</span>
              <span className="font-medium text-gray-800 text-right max-w-[200px]">{customer.address}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Plan</span>
              <span className="font-medium text-gray-800">
                {customer.planId ? customer.planId.name : 'Custom Plan'} (₹{customer.planPrice}/month)
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Plan Start</span>
              <span className="font-medium text-gray-800">
                {new Date(customer.planStartDate).toLocaleDateString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  customer.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {customer.status}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Subscription</h2>
          {subscription ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Monthly Price</span>
                <span className="font-medium text-gray-800">₹{subscription.monthlyPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Start Date</span>
                <span className="font-medium text-gray-800">
                  {new Date(subscription.startDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Pauses</span>
                <span className="font-medium text-gray-800">
                  {subscription.pausePeriods?.length || 0}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No subscription found</p>
          )}
        </div>

        {/* Pause History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pause History</h2>
          {subscription?.pausePeriods?.length > 0 ? (
            <div className="space-y-2">
              {subscription.pausePeriods.map((p, i) => (
                <div
                  key={p._id || i}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 text-sm"
                >
                  <span className="text-gray-600">
                    {new Date(p.startDate).toLocaleDateString('en-IN')}
                    {' → '}
                    {p.endDate
                      ? new Date(p.endDate).toLocaleDateString('en-IN')
                      : <span className="text-yellow-600 font-medium">Ongoing</span>
                    }
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No pause history</p>
          )}
        </div>

        {/* Billing */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Generate Bill</h2>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Month
                </label>
                <input
                  type="month"
                  value={billMonth}
                  onChange={(e) => setBillMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                onClick={fetchBill}
                disabled={billLoading}
                className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {billLoading ? 'Loading...' : 'View Bill'}
              </button>
            </div>
          </div>

          {bill && <BillCard billing={bill} />}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <PauseResumeModal
          customer={customer}
          action={modal.action}
          onConfirm={handlePauseResume}
          onClose={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Customer"
          message={`Are you sure you want to delete "${customer.name}"? This will also remove their subscription. This action cannot be undone.`}
          confirmText="Delete"
          confirmColor="red"
          onConfirm={confirmDelete}
          onClose={() => setShowDeleteConfirm(false)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default CustomerDetails;
