import { useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash, HiOutlinePause, HiOutlinePlay, HiOutlineCurrencyRupee } from 'react-icons/hi';

const CustomerTable = ({ customers, onDelete, onPause, onResume }) => {
  const navigate = useNavigate();

  if (!customers || customers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <HiOutlineCurrencyRupee className="mx-auto text-4xl text-gray-300 mb-3" />
        <p className="text-gray-500">No customers found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Address</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Plan (₹)</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{customer.name}</td>
                <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell max-w-[200px] truncate">
                  {customer.address}
                </td>
                <td className="px-4 py-3 text-gray-800 font-medium">₹{customer.planPrice}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {customer.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => navigate(`/customers/${customer._id}`)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="View"
                    >
                      <HiOutlineEye size={17} />
                    </button>
                    <button
                      onClick={() => navigate(`/customers/${customer._id}/edit`)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                      title="Edit"
                    >
                      <HiOutlinePencil size={17} />
                    </button>
                    {customer.status === 'active' ? (
                      <button
                        onClick={() => onPause(customer)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                        title="Pause"
                      >
                        <HiOutlinePause size={17} />
                      </button>
                    ) : (
                      <button
                        onClick={() => onResume(customer)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Resume"
                      >
                        <HiOutlinePlay size={17} />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(customer)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <HiOutlineTrash size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;
