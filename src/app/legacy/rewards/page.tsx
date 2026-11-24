import Link from "next/link";

export default function RewardsPage() {
  return (
    <div>
      <div className="px-6 py-2 text-xs text-gray-500 border-b">
        <Link href="/legacy/" className="hover:underline">Home</Link> &rsaquo; My Rewards
      </div>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-4">My Rewards</h1>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-56 shrink-0 space-y-3">
            <div className="border rounded overflow-hidden">
              <div className="bg-blue-700 text-white text-xs font-bold px-3 py-2">NOTICES</div>
              <a href="#" className="block px-3 py-2 text-sm hover:bg-blue-50 border-b">Wellness Program Notices</a>
              <a href="#" className="block px-3 py-2 text-sm hover:bg-blue-50">Last Year Rewards (2025)</a>
            </div>
            <div className="border rounded overflow-hidden">
              <div className="bg-blue-700 text-white text-xs font-bold px-3 py-2">START EARNING POINTS</div>
              <div className="p-2 space-y-2">
                <Link href="/legacy/track/activities" className="block w-full bg-blue-600 text-white text-xs text-center py-1.5 rounded hover:bg-blue-700">Track Activity</Link>
                <Link href="/legacy/assessment" className="block w-full bg-blue-600 text-white text-xs text-center py-1.5 rounded hover:bg-blue-700">Take the Goal Path Assessment</Link>
                <Link href="#" className="block w-full bg-blue-600 text-white text-xs text-center py-1.5 rounded hover:bg-blue-700">Discounted Gym Memberships</Link>
                <Link href="/legacy/body/biometric-screening" className="block w-full bg-blue-600 text-white text-xs text-center py-1.5 rounded hover:bg-blue-700">Schedule a Biometric Screening</Link>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { title: "View Biometric Screening Results", img: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&q=80" },
                { title: "Program Overview Coming Soon!", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b6f81?w=300&q=80" },
                { title: "Meet Your Wellness Program Champions", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&q=80" },
                { title: "Gym Membership Discounts", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80" },
              ].map((item) => (
                <a key={item.title} href="#" className="relative block h-24 rounded overflow-hidden shadow group">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40" />
                  <span className="absolute bottom-2 left-2 text-white text-xs font-semibold">{item.title}</span>
                </a>
              ))}
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1">
            {/* Hero */}
            <div
              className="relative rounded overflow-hidden h-32 flex items-center justify-center mb-6"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80')", backgroundSize: "cover", backgroundPosition: "center" }}
            >
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative z-10 text-white text-center">
                <p className="text-xs uppercase tracking-widest">COLORADO SPRINGS</p>
                <h2 className="text-2xl font-bold">REACH YOUR PEAK YEAR 22</h2>
              </div>
            </div>

            <div className="bg-white border rounded p-6 shadow-sm">
              <p className="text-sm text-gray-700 mb-4">
                <strong>Welcome to Reach Your Peak!</strong> This employee wellness program was designed specifically for City employees — offering a variety of activities and wellness challenges to help balance your Mind, Body, and Life.
              </p>

              <p className="text-sm font-semibold text-gray-800 mb-2">To successfully complete the program and earn the <strong>$400 employee incentive</strong>:</p>
              <ol className="list-decimal pl-5 text-sm text-blue-700 mb-4 space-y-1">
                <li>Complete a <strong>Biometric Health Screening</strong> or equivalent by May 31, 2026</li>
                <li>Accrue <strong>400 points</strong> by November 30, 2026</li>
              </ol>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-gray-700 mb-4">
                <strong>Please note:</strong> your Incentive Progress Bar will <strong>NOT activate</strong> until a biometric health screening has been completed. To self-report optional point accruing activities, simply log the date of completion and type of activity in the <strong>&quot;Track&quot;</strong> tab.
              </div>

              <div className="flex gap-4 text-xs text-blue-600">
                <a href="#" className="underline hover:text-blue-800">Download the 2026 Program Guide</a>
                <a href="#" className="underline hover:text-blue-800">Frequently Asked Questions</a>
              </div>

              <div className="mt-6 bg-gray-100 border rounded p-4 text-sm text-center text-gray-500">
                You are currently not enrolled in an incentive program.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
