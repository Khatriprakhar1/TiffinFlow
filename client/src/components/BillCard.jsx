const BillCard = ({ billing }) => {
  if (!billing) return null;

  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Bill — {monthNames[billing.month]} {billing.year}
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total Weekdays</span>
          <span className="font-medium text-gray-800">{billing.totalWeekdays}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Paused Weekdays</span>
          <span className="font-medium text-red-500">-{billing.pausedWeekdays}</span>
        </div>
        <div className="flex justify-between text-sm border-t pt-3">
          <span className="text-gray-500">Billable Weekdays</span>
          <span className="font-semibold text-gray-800">{billing.billableDays}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Monthly Plan</span>
          <span className="font-medium text-gray-800">₹{billing.monthlyPrice}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Daily Rate</span>
          <span className="font-medium text-gray-800">₹{billing.dailyRate}</span>
        </div>
        <div className="flex justify-between text-base border-t pt-3 border-dashed">
          <span className="font-semibold text-gray-700">Final Bill</span>
          <span className="font-bold text-xl text-orange-600">₹{billing.finalBill}</span>
        </div>
      </div>
    </div>
  );
};

export default BillCard;
