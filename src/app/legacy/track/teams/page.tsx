export default function TeamsPage() {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button className="bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700 flex items-center gap-1">
          <span>+</span> Create New Team
        </button>
      </div>
      <div className="space-y-4">
        <div className="border rounded overflow-hidden shadow-sm">
          <div className="bg-blue-700 text-white font-bold text-sm px-4 py-2">Team Invitations</div>
          <div className="p-6 text-center text-gray-500 text-sm">You currently have no Team Invitations</div>
        </div>
        <div className="border rounded overflow-hidden shadow-sm">
          <div className="bg-blue-700 text-white font-bold text-sm px-4 py-2">My Teams</div>
          <div className="p-6 text-center text-gray-500 text-sm">You are currently not a member of a team so create a new team!</div>
        </div>
      </div>
    </div>
  );
}
