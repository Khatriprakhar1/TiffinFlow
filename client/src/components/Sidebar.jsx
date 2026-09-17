import { NavLink } from 'react-router-dom';
import {
  HiOutlineHome, HiOutlineUsers, HiOutlineUserAdd, HiOutlineClipboardList,
  HiOutlineClock, HiOutlineSwitchHorizontal, HiOutlineUpload
} from 'react-icons/hi';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { to: '/customers', label: 'Customers', icon: HiOutlineUsers },
  { to: '/customers/new', label: 'Add Customer', icon: HiOutlineUserAdd },
  { to: '/plans', label: 'Tiffin Plans', icon: HiOutlineClipboardList },
  { divider: true },
  { to: '/clock', label: 'Clock & Notify', icon: HiOutlineClock },
  { to: '/transfers', label: 'Transfers', icon: HiOutlineSwitchHorizontal },
  { to: '/import', label: 'Import Data', icon: HiOutlineUpload },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-[57px] left-0 h-[calc(100vh-57px)] w-60 bg-white border-r border-gray-200 z-20 transform transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="p-4 space-y-1">
          {links.map((item, idx) => {
            if (item.divider) {
              return <hr key={`div-${idx}`} className="my-3 border-gray-200" />;
            }
            const { to, label, icon: Icon } = item;
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
