export default function GoalsPage() {
  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <button className="bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700 flex items-center gap-1">
          <span>+</span> Create New Goal
        </button>
        <button className="bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a3 3 0 01-3-3V6z" clipRule="evenodd" /></svg>
          View My Past Goals
        </button>
      </div>
      <div className="border rounded overflow-hidden shadow-sm">
        <div className="bg-blue-700 text-white font-bold text-sm px-4 py-2">Current Goals</div>
        <div className="p-8 text-center text-gray-500 text-sm">You have no current goals</div>
      </div>
    </div>
  );
}
