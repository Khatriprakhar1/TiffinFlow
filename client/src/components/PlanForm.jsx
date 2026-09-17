import { useState } from 'react';

const PlanForm = ({ initialData, onSubmit, loading, isEdit }) => {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    mealType: initialData?.mealType || 'lunch',
    items: initialData?.items?.join(', ') || '',
    price: initialData?.price || '',
    isVeg: initialData?.isVeg !== undefined ? initialData.isVeg : true,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Plan name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Price must be positive';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      price: Number(form.price),
      items: form.items
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean),
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.name ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder="e.g., Veg Lunch Thali"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={2}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.description ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder="Home-style vegetarian lunch with fresh ingredients..."
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
          <select
            name="mealType"
            value={form.mealType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="lunch">🌞 Lunch Only</option>
            <option value="dinner">🌙 Dinner Only</option>
            <option value="both">✨ Lunch + Dinner</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price (₹)</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.price ? 'border-red-400' : 'border-gray-300'
            }`}
            placeholder="3000"
            min="1"
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Menu Items <span className="text-gray-400 font-normal">(comma-separated)</span>
        </label>
        <input
          name="items"
          value={form.items}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Dal, Rice, 2 Roti, Sabzi, Salad, Pickle"
        />
        <p className="text-xs text-gray-400 mt-1">
          Separate items with commas. These show on the public menu.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="isVeg"
            checked={form.isVeg}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
        </label>
        <span className="text-sm font-medium text-gray-700">
          {form.isVeg ? '🟢 Vegetarian' : '🔴 Non-Vegetarian'}
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
      </button>
    </form>
  );
};

export default PlanForm;
