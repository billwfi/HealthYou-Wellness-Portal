import Link from "next/link";

const upcomingEvents = [
  { title: "Nationwide | Personal Finance 101", date: "May 27, 2026", time: "9:00 AM – 10:00 AM" },
  { title: "Profile EAP | Dealing with Prolonged Grief", date: "May 27, 2026", time: "9:00 AM – 10:00 AM" },
  { title: "Ent Credit Union | Spend with Intention", date: "May 28, 2026", time: "9:30 AM – 10:00 AM" },
  { title: "Nationwide | Investment Basics – Retire and Rewards", date: "June 4, 2026", time: "9:00 AM – 10:00 AM" },
  { title: "Profile EAP | Parenting Your Teens: Career and Life Goals", date: "June 10, 2026", time: "11:30 AM – 12:30 PM" },
];

const popularActivities = [
  { title: "Health Coaching", href: "/legacy/body/health-coaching", img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80" },
  { title: "Biometric Screening", href: "/legacy/body/biometric-screening", img: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=80" },
  { title: "Sync Your Device", href: "/legacy/settings/connect-device", img: "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=400&q=80" },
  { title: "UCCS Programs", href: "/legacy/body/uccs-programs", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { title: "Food & Mood Resources", href: "/legacy/body/food-mood-resources", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80" },
];

const pollOptions = [
  "Knowing which foods actually help",
  "Finding time to prepare healthy meals",
  "Staying consistent with healthy habits",
  "Managing cravings or emotional eating",
  "Budgeting for nutritious options",
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div
        className="relative bg-cover bg-center h-64 flex flex-col items-center justify-center text-white text-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10">
          <h1 className="text-5xl font-bold drop-shadow mb-2">Reach Your Peak</h1>
          <p className="text-lg mb-4">Goal Path Assessment - Discover Your Wellbeing</p>
          <Link href="/legacy/assessment" className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded transition-colors">
            Start Here
          </Link>
        </div>
      </div>

      {/* Goal Path Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {[
          { label: "Body", href: "/legacy/body", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80" },
          { label: "Life", href: "/legacy/life", img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80" },
          { label: "Mind", href: "/legacy/mind", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80" },
        ].map((cat) => (
          <Link key={cat.href} href={cat.href} className="relative h-56 overflow-hidden group block">
            <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            <span className="absolute top-4 left-4 text-5xl font-bold text-white drop-shadow">{cat.label}</span>
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-1 rounded">
                Click here for {cat.label} Resources
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Wellness Topic + Look Ahead */}
      <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 border-t border-b">
        <div className="flex items-center justify-center bg-white p-8 border-r">
          <div className="text-center">
            <p className="text-blue-700 font-semibold uppercase text-sm tracking-wide mb-1">Your Monthly</p>
            <h2 className="text-3xl font-bold text-green-600">Wellness Topic</h2>
            <p className="text-gray-500 text-sm mt-2">Check back each month for new wellness education</p>
          </div>
        </div>
        <div className="bg-white p-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">LOOK AHEAD</h3>
          <ul className="space-y-2">
            {upcomingEvents.map((ev, i) => (
              <li key={i} className="flex gap-2 text-sm border-b pb-2 last:border-0">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-800 text-xs">{ev.title}</p>
                  <p className="text-gray-500 text-xs">{ev.date}, {ev.time}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/legacy/calendar" className="text-blue-600 text-xs mt-3 inline-block hover:underline">Calendar of Events &rsaquo;</Link>
        </div>
      </div>

      {/* Popular Activities */}
      <div className="py-8 px-4">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Popular Activities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {popularActivities.map((act) => (
            <Link key={act.href} href={act.href} className="relative h-40 rounded overflow-hidden group block shadow">
              <img src={act.img} alt={act.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <span className="absolute bottom-3 left-3 text-white font-semibold text-sm drop-shadow">{act.title}</span>
            </Link>
          ))}
          {/* Poll */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 shadow">
            <p className="text-xs font-bold text-gray-700 mb-2">
              POLL QUESTION: What&apos;s your biggest challenge when it comes to using food to support your mental and emotional wellbeing?
            </p>
            <form>
              {pollOptions.map((opt) => (
                <label key={opt} className="flex items-start gap-2 text-xs text-gray-600 mb-1 cursor-pointer">
                  <input type="radio" name="poll" value={opt} className="mt-0.5" />
                  {opt}
                </label>
              ))}
              <button type="submit" className="mt-2 bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
