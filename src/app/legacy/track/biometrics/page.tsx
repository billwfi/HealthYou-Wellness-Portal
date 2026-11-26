import Link from "next/link";

export default function BiometricsPage() {
  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <Link href="/legacy/track/dashboard" className="bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700 flex items-center gap-1">
          <span>+</span> Create New Entry
        </Link>
        <button className="bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded hover:bg-gray-300">Filter</button>
        <button className="bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded hover:bg-gray-300">Sort</button>
        <button className="bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded hover:bg-gray-300">Export</button>
      </div>
      <div className="border rounded overflow-hidden shadow-sm">
        <div className="bg-blue-700 text-white font-bold text-sm px-4 py-2 flex items-center gap-2">
          Biometric Entries
          <svg className="w-4 h-4 text-blue-200" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
        </div>
        <div className="p-8 text-center text-gray-500 text-sm">No Biometric Entries Found</div>
        <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <button className="px-1">|◀</button>
            <button className="px-1">◀</button>
            <span>Page</span>
            <input type="number" defaultValue={1} className="w-12 border rounded px-1 py-0.5 text-center text-xs" />
            <span>of 0</span>
            <button className="px-1">▶</button>
            <button className="px-1">▶|</button>
          </div>
          <span>0 – 0 of 0 items</span>
        </div>
      </div>
    </div>
  );
}
