import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { planAPI } from '../api';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineSparkles,
  HiOutlineEye,
} from 'react-icons/hi';

const mealIcons = {
  lunch: HiOutlineSun,
  dinner: HiOutlineMoon,
  both: HiOutlineSparkles,
};

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await planAPI.getAll({ activeOnly: 'false' });
      setPlans(res.data.data);
    } catch (err) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await planAPI.delete(deleteTarget._id);
      toast.success('Plan deactivated');
      setDeleteTarget(null);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete plan');
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleActive = async (plan) => {
    try {
      await planAPI.update(plan._id, { isActive: !plan.isActive });
      toast.success(plan.isActive ? 'Plan hidden from menu' : 'Plan visible on menu');
      fetchPlans();
    } catch (err) {
      toast.error('Failed to update plan');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tiffin Plans</h1>
          <p className="text-sm text-gray-500">Manage your tiffin service plans and menu</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/menu"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HiOutlineEye size={18} /> View Public Menu
          </Link>
          <Link
            to="/plans/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            <HiOutlinePlus size={18} /> Add Plan
          </Link>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <HiOutlineSparkles className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500 mb-2">No tiffin plans created yet</p>
          <Link to="/plans/new" className="text-orange-500 text-sm font-medium hover:underline">
            Create your first plan →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => {
            const MealIcon = mealIcons[plan.mealType] || HiOutlineSun;
            return (
              <div
                key={plan._id}
                className={`bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
                  !plan.isActive ? 'opacity-60' : ''
                }`}
              >
                {/* Plan info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">{plan.name}</h3>
                    {!plan.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate mb-2">{plan.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                      <MealIcon size={12} />
                      {plan.mealType === 'both' ? 'Lunch + Dinner' : plan.mealType.charAt(0).toUpperCase() + plan.mealType.slice(1)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      plan.isVeg ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {plan.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                    {plan.items?.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {plan.items.length} items
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-gray-900">₹{plan.price}</p>
                  <p className="text-xs text-gray-400">/month</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(plan)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      plan.isActive
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {plan.isActive ? 'Hide' : 'Show'}
                  </button>
                  <Link
                    to={`/plans/${plan._id}/edit`}
                    className="p-2 rounded-lg text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                    title="Edit"
                  >
                    <HiOutlinePencil size={17} />
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(plan)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <HiOutlineTrash size={17} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Deactivate Plan"
          message={`Deactivate "${deleteTarget.name}"? It will be hidden from the public menu. Existing customers on this plan are not affected.`}
          confirmText="Deactivate"
          confirmColor="red"
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default Plans;
