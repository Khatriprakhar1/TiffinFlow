import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { planAPI } from '../api';
import PlanForm from '../components/PlanForm';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const EditPlan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      const res = await planAPI.getOne(id);
      setPlan(res.data.data);
    } catch (err) {
      toast.error('Plan not found');
      navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      await planAPI.update(id, data);
      toast.success('Plan updated');
      navigate('/plans');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Link to="/plans" className="p-2 rounded-lg hover:bg-gray-200 text-gray-500">
            <HiOutlineArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Plan</h1>
        </div>
        <p className="text-sm text-gray-500 ml-11">Update tiffin plan details</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <PlanForm initialData={plan} onSubmit={handleSubmit} loading={saving} isEdit />
      </div>
    </div>
  );
};

export default EditPlan;
