import { useState, useEffect } from 'react';
import { planAPI } from '../api';

const CustomerForm = ({ initialData, onSubmit, loading, isEdit }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    planId: '',
    planPrice: '',
    planStartDate: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await planAPI.getAll({ activeOnly: 'true' });
        setPlans(res.data.data);
      } catch (err) {
        console.error('Failed to load plans', err);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        planId: initialData.planId || '',
        planPrice: initialData.planPrice || '',
        planStartDate: initialData.planStartDate
          ? new Date(initialData.planStartDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Phone must be 10 digits';
    if (!form.address.trim()) errs.address = 'Address is required';
    
    if (form.planId !== 'none') {
      if (!form.planPrice || Number(form.planPrice) <= 0) errs.planPrice = 'Plan price must be positive';
      if (!form.planStartDate) errs.planStartDate = 'Start date is required';
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const isNoPlan = form.planId === 'none';
    
    onSubmit({
      ...form,
      planPrice: isNoPlan ? 0 : Number(form.planPrice),
      planId: isNoPlan ? 'none' : (form.planId || undefined),
      planStartDate: isNoPlan ? undefined : form.planStartDate
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'planId') {
      const selectedPlan = plans.find(p => p._id === value);
      setForm({
        ...form,
        planId: value,
        planPrice: selectedPlan ? selectedPlan.price : form.planPrice
      });
    } else {
      setForm({ ...form, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.name ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder="John Doe"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.phone ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder="9876543210"
          maxLength={10}
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={2}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.address ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder="123, Main Street, City"
        />
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Tiffin Plan (Optional)</label>
          <select
            name="planId"
            value={form.planId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">-- Custom Plan (Enter price manually) --</option>
            <option value="none">-- No Plan (For Transfer Target) --</option>
            {plans.map(plan => (
              <option key={plan._id} value={plan._id}>
                {plan.name} (₹{plan.price})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Plan Price (₹)</label>
          <input
            name="planPrice"
            type="number"
            value={form.planId === 'none' ? '' : form.planPrice}
            onChange={handleChange}
            disabled={form.planId === 'none'}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.planPrice ? 'border-red-400' : 'border-gray-300'
            } ${form.planId === 'none' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
            placeholder="3000"
            min="1"
          />
          {errors.planPrice && <p className="text-red-500 text-xs mt-1">{errors.planPrice}</p>}
        </div>

        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Start Date</label>
            <input
              name="planStartDate"
              type="date"
              value={form.planId === 'none' ? '' : form.planStartDate}
              onChange={handleChange}
              disabled={form.planId === 'none'}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.planStartDate ? 'border-red-400' : 'border-gray-300'
              } ${form.planId === 'none' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
            />
            {errors.planStartDate && <p className="text-red-500 text-xs mt-1">{errors.planStartDate}</p>}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving...' : isEdit ? 'Update Customer' : 'Add Customer'}
      </button>
    </form>
  );
};

export default CustomerForm;
