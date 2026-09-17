import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { planAPI } from '../api';
import PlanForm from '../components/PlanForm';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const AddPlan = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await planAPI.create(data);
      toast.success('Plan created successfully');
      navigate('/plans');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Link to="/plans" className="p-2 rounded-lg hover:bg-gray-200 text-gray-500">
            <HiOutlineArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Tiffin Plan</h1>
        </div>
        <p className="text-sm text-gray-500 ml-11">Add a new plan to your tiffin menu</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <PlanForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default AddPlan;
