const SortDropdown = ({ sortBy, order, onSortChange }) => {
  return (
    <div className="flex items-center gap-2">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value, order)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <option value="createdAt">Date Added</option>
        <option value="name">Name</option>
        <option value="planPrice">Plan Price</option>
        <option value="status">Status</option>
      </select>
      <select
        value={order}
        onChange={(e) => onSortChange(sortBy, e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
};

export default SortDropdown;
