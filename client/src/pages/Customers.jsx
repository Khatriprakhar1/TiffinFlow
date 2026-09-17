import { useState, useEffect, useCallback } from 'react';
import { customerAPI, subscriptionAPI } from '../api';
import CustomerTable from '../components/CustomerTable';
import Pagination from '../components/Pagination';
import SortDropdown from '../components/SortDropdown';
import PauseResumeModal from '../components/PauseResumeModal';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePlus } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [modal, setModal] = useState(null); // { customer, action }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerAPI.getAll({
        search,
        status: statusFilter,
        page,
        limit: 10,
        sortBy,
        order,
      });
      setCustomers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, sortBy, order]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = (customer) => {
    setDeleteTarget(customer);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await customerAPI.delete(deleteTarget._id);
      toast.success('Customer deleted');
      setDeleteTarget(null);
      fetchCustomers();
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
        await subscriptionAPI.pause(modal.customer._id, { startDate: date });
        toast.success('Subscription paused');
      } else {
        await subscriptionAPI.resume(modal.customer._id, { endDate: date });
        toast.success('Subscription resumed');
      }
      setModal(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">
            {pagination ? `${pagination.total} total customers` : 'Manage your customers'}
          </p>
        </div>
        <Link
          to="/customers/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          <HiOutlinePlus size={18} /> Add Customer
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
        <SortDropdown
          sortBy={sortBy}
          order={order}
          onSortChange={(s, o) => { setSortBy(s); setOrder(o); setPage(1); }}
        />
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <CustomerTable
            customers={customers}
            onDelete={handleDelete}
            onPause={(c) => setModal({ customer: c, action: 'pause' })}
            onResume={(c) => setModal({ customer: c, action: 'resume' })}
          />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      {modal && (
        <PauseResumeModal
          customer={modal.customer}
          action={modal.action}
          onConfirm={handlePauseResume}
          onClose={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Customer"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This will also remove their subscription. This action cannot be undone.`}
          confirmText="Delete"
          confirmColor="red"
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default Customers;
