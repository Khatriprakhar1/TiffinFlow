import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../api';
import CustomerForm from '../components/CustomerForm';
import toast from 'react-hot-toast';

const AddCustomer = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await customerAPI.create(data);
      toast.success('Customer added successfully');
      navigate('/customers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Customer</h1>
        <p className="text-sm text-gray-500">Create a new tiffin subscription</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CustomerForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default AddCustomer;
