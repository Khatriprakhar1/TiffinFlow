import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GiHotMeal } from 'react-icons/gi';
import { HiOutlineClipboardCheck, HiOutlineCurrencyRupee, HiOutlineSearch, HiOutlinePause, HiOutlineChartBar, HiOutlineUserGroup, HiOutlineChatAlt2, HiOutlineCreditCard, HiOutlineTruck } from 'react-icons/hi';

const features = [
  { icon: HiOutlineUserGroup, title: 'Customer Management', desc: 'Add, edit, and track all your tiffin customers in one place.' },
  { icon: HiOutlinePause, title: 'Pause & Resume', desc: 'Easily pause subscriptions for travel or holidays — no manual tracking.' },
  { icon: HiOutlineCurrencyRupee, title: 'Smart Billing', desc: 'Auto-calculate bills based on actual weekday deliveries, excluding pauses.' },
  { icon: HiOutlineSearch, title: 'Quick Search', desc: 'Find any customer instantly by name or phone number.' },
  { icon: HiOutlineChartBar, title: 'Dashboard Analytics', desc: 'See active, paused, and total customers with revenue estimates at a glance.' },
  { icon: HiOutlineClipboardCheck, title: 'Pause History', desc: 'Full audit trail of every pause and resume — nothing gets lost.' },
];

const futureFeatures = [
  { icon: HiOutlineChatAlt2, title: 'WhatsApp / SMS Notifications', desc: 'Send automated billing reminders and pause confirmations to customers.' },
  { icon: HiOutlineCreditCard, title: 'Online Payment & Invoices', desc: 'Generate PDF invoices and accept payments via UPI and cards.' },
  { icon: HiOutlineTruck, title: 'Delivery Route Optimization', desc: 'Manage delivery partners and optimize daily delivery routes.' },
];

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <GiHotMeal className="text-orange-500 text-5xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tiffin<span className="text-orange-500">Flow</span>
          </h1>
          <p className="text-xl text-gray-600 mb-3 max-w-2xl mx-auto">
            Tiffin Subscription & Billing Management System
          </p>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            The simplest way for home-style tiffin services to manage customers,
            handle pause/resume subscriptions, and generate accurate pro-rated monthly bills.
          </p>
          <div className="flex items-center justify-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">The Problem</h2>
          <p className="text-gray-600 leading-relaxed">
            Running a home tiffin service means juggling dozens of customers. Some pause for travel,
            some for festivals. Tracking who paused when, calculating bills that exclude weekends and
            paused days, and doing it all on paper or spreadsheets? That's a recipe for billing errors
            and lost revenue.
          </p>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Who Is This For?</h2>
          <p className="text-gray-600 leading-relaxed">
            TiffinFlow is built for <strong>home-style tiffin service owners</strong> and small
            cloud kitchen operators who deliver daily lunch/dinner to subscribed customers.
            If you deliver food on weekdays and need to bill accurately at month-end — this is for you.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-5 rounded-xl border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all">
                <f.icon className="text-orange-500 text-2xl mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Helps */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How TiffinFlow Helps</h2>
          <div className="text-gray-600 space-y-3 text-left max-w-xl mx-auto">
            <p>✅ <strong>No more billing mistakes</strong> — the system auto-calculates weekday-based bills.</p>
            <p>✅ <strong>Pause tracking is automatic</strong> — just click pause/resume.</p>
            <p>✅ <strong>Instant search</strong> — find any customer by phone in seconds.</p>
            <p>✅ <strong>Dashboard overview</strong> — know your active count and revenue at a glance.</p>
            <p>✅ <strong>Full history</strong> — every pause period is recorded for transparency.</p>
          </div>
        </div>
      </section>

      {/* Future Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Coming Next</h2>
          <p className="text-center text-gray-500 text-sm mb-10">Future features on our roadmap</p>
          <div className="grid md:grid-cols-3 gap-6">
            {futureFeatures.map((f, i) => (
              <div key={i} className="p-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 relative">
                <span className="absolute top-3 right-3 text-[10px] uppercase font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
                <f.icon className="text-gray-400 text-2xl mb-3" />
                <h3 className="font-semibold text-gray-600 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to simplify your tiffin business?</h2>
          <p className="text-gray-500 mb-6">Sign up in seconds and start managing your customers today.</p>
          {!user && (
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
            >
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400 border-t">
        <p>© {new Date().getFullYear()} TiffinFlow. Built for the Builder Round Assessment.</p>
      </footer>
    </div>
  );
};

export default Landing;
