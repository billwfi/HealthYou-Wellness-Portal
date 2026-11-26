const allChallenges = [
  {
    name: "RYP22 2: Eat, Think, Thrive Challenge",
    dates: "May 11, 2026 – Jun 25, 2026",
    goal: "8 Times",
    activities: "*2026 Challenge 2- Mindful, *2026 Challenge 2- Mouthful",
    type: "Individual",
  },
  {
    name: "RYP22 1: Olympic City Strength Challenge",
    dates: "Feb 2, 2026 – Mar 16, 2026",
    goal: "8 Times",
    activities: "*2026 Challenge 1- Champion Mindset, *2026 Challenge 1-Peak Performance",
    type: "Individual",
  },
  {
    name: "RYP21 3: Rev Up Your Mind Beat Cognitive Decline",
    dates: "Sep 15, 2025 – Oct 27, 2025",
    goal: "8 Entries",
    activities: "Fire It Up 1–6, Wired Connection 1–6",
    type: "Individual",
  },
  {
    name: "RYP 21 Challenge 2: Social Ties Help You Survive",
    dates: "May 5, 2025 – Jun 16, 2025",
    goal: "8 Entries",
    activities: "Social Ties 1–12",
    type: "Individual",
  },
];

function ChallengeRow({ c }: { c: typeof allChallenges[0] }) {
  return (
    <div className="flex items-start gap-3 p-3 border-b last:border-0 hover:bg-blue-50 cursor-pointer text-sm">
      <div className="w-10 h-10 bg-blue-700 rounded flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-blue-800">{c.name}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 text-xs text-gray-600">
          <div><span className="text-gray-400">Start–End</span><br />{c.dates}</div>
          <div><span className="text-gray-400">Goal</span><br />{c.goal}</div>
          <div className="md:col-span-1"><span className="text-gray-400">Activities</span><br />{c.activities}</div>
          <div><span className="text-gray-400">Type</span><br />{c.type}</div>
        </div>
      </div>
    </div>
  );
}

export default function TrackChallengesPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button className="bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700">+ Create New Challenge</button>
        <button className="bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700">🏆 View My Past Challenges</button>
      </div>

      <div className="border rounded overflow-hidden shadow-sm">
        <div className="bg-blue-700 text-white font-bold text-sm px-4 py-2">Private Challenge Invitations</div>
        <div className="p-6 text-center text-gray-500 text-sm">You currently have no Private Challenge Invitations</div>
      </div>

      <div className="border rounded overflow-hidden shadow-sm">
        <div className="bg-blue-700 text-white font-bold text-sm px-4 py-2">My Current Challenges</div>
        <div className="p-6 text-center text-gray-500 text-sm">You are not entered into any Current Challenges</div>
      </div>

      <div className="border rounded overflow-hidden shadow-sm">
        <div className="bg-blue-700 text-white font-bold text-sm px-4 py-2">Available Challenges</div>
        <ChallengeRow c={allChallenges[0]} />
      </div>

      <div className="border rounded overflow-hidden shadow-sm">
        <div className="bg-blue-700 text-white font-bold text-sm px-4 py-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            All Challenges
            <svg className="w-4 h-4 text-blue-200" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
          </span>
          <button className="bg-gray-600 text-white text-xs px-2 py-1 rounded hover:bg-gray-700 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.553.894l-4 2A1 1 0 016 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>
            Filter
          </button>
        </div>
        {allChallenges.map((c) => <ChallengeRow key={c.name} c={c} />)}
      </div>
    </div>
  );
}
