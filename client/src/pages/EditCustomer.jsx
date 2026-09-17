import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customerAPI } from '../api';
import CustomerForm from '../components/CustomerForm';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await customerAPI.getOne(id);
      setCustomer(res.data.data);
    } catch (err) {
      toast.error('Customer not found');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      await customerAPI.update(id, data);
      toast.success('Customer updated');
      navigate(`/customers/${id}`);
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
          <Link to={`/customers/${id}`} className="p-2 rounded-lg hover:bg-gray-200 text-gray-500">
            <HiOutlineArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
        </div>
        <p className="text-sm text-gray-500 ml-11">Update customer information</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CustomerForm
          initialData={customer}
          onSubmit={handleSubmit}
          loading={saving}
          isEdit
        />
      </div>
    </div>
  );
};

export default EditCustomer;
