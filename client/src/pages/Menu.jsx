import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { planAPI } from '../api';
import Loading from '../components/Loading';
import { GiHotMeal, GiMeal, GiCookingPot } from 'react-icons/gi';
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineSparkles,
  HiOutlineCheck,
  HiOutlineFilter,
} from 'react-icons/hi';

const mealTypeConfig = {
  lunch: { label: 'Lunch', icon: HiOutlineSun, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  dinner: { label: 'Dinner', icon: HiOutlineMoon, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  both: { label: 'Lunch + Dinner', icon: HiOutlineSparkles, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
};

const Menu = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | lunch | dinner | both
  const [vegFilter, setVegFilter] = useState('all'); // all | veg | nonveg

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await planAPI.getAll({ activeOnly: 'true' });
      setPlans(res.data.data);
    } catch (err) {
      console.error('Failed to load plans', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (filter !== 'all' && p.mealType !== filter) return false;
    if (vegFilter === 'veg' && !p.isVeg) return false;
    if (vegFilter === 'nonveg' && p.isVeg) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
      {/* Header */}
      <div className="pt-20 pb-10 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <GiHotMeal className="text-orange-500 text-4xl" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our <span className="text-orange-500">Tiffin</span> Menu
          </h1>
        </div>
        <p className="text-gray-500 max-w-xl mx-auto">
          Choose from our home-style tiffin plans. Fresh, hygienic meals delivered to your doorstep every weekday.
          Pick what suits your taste and schedule!
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Meal type filter */}
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
            {[
              { key: 'all', label: 'All Plans' },
              { key: 'lunch', label: '🌞 Lunch' },
              { key: 'dinner', label: '🌙 Dinner' },
              { key: 'both', label: '✨ Both' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f.key
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Veg filter */}
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'veg', label: '🟢 Veg' },
              { key: 'nonveg', label: '🔴 Non-Veg' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setVegFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  vegFilter === f.key
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {loading ? (
          <Loading />
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-16">
            <GiCookingPot className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No plans available</h3>
            <p className="text-gray-400 text-sm">
              {plans.length === 0
                ? 'Menu is being prepared. Check back soon!'
                : 'No plans match your filters. Try a different combination.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => {
              const mc = mealTypeConfig[plan.mealType];
              return (
                <div
                  key={plan._id}
                  className={`relative bg-white rounded-2xl border ${mc.border} shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group`}
                >
                  {/* Top accent bar */}
                  <div className={`h-1.5 ${plan.isVeg ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`} />

                  <div className="p-6">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${mc.bg} ${mc.color}`}>
                        <mc.icon size={14} />
                        {mc.label}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        plan.isVeg
                          ? 'bg-green-50 text-green-600 border border-green-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {plan.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                      </span>
                    </div>

                    {/* Name & description */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{plan.description}</p>

                    {/* Items */}
                    {plan.items && plan.items.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          What's included
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {plan.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-sm text-gray-600">
                              <HiOutlineCheck className="text-green-500 shrink-0" size={14} />
                              <span className="truncate">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400">Monthly price</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                          <span className="text-sm text-gray-400">/month</span>
                        </div>
                      </div>
                      <Link
                        to="/register"
                        className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                      >
                        Subscribe
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="py-12 px-4 bg-white border-t">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Ready to start your tiffin subscription?
          </h2>
          <p className="text-gray-500 mb-6">
            Sign up now and never worry about cooking again. Fresh, home-style meals every weekday.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
            >
              Get Started
            </Link>
            <Link
              to="/"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400 border-t">
        <p>© {new Date().getFullYear()} TiffinFlow. Home-style meals, delivered fresh.</p>
      </footer>
    </div>
  );
};

export default Menu;
