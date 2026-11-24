import Link from "next/link";

const resources = [
  { title: "UCCS Cooking Class", pts: "18 pts", img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&q=80", href: "/legacy/body/uccs-programs" },
  { title: "HealthYou Mindful Eating", pts: "55 pts", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80", href: "#" },
  { title: "Nutritional Wellness", pts: "15 pts", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&q=80", href: "#" },
  { title: "HealthYou Produce Rx Challenge", pts: "55 pts", img: "https://images.unsplash.com/photo-1425421669292-0c3da3b8f529?w=300&q=80", href: "#" },
  { title: "HealthYou Health Coaching", pts: "50 pts", img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&q=80", href: "/legacy/body/health-coaching" },
  { title: "Weight Management Program", pts: "15 pts", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80", href: "#" },
  { title: "Make a Healthy Plate", pts: "10 pts", img: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=300&q=80", href: "#" },
  { title: "Cooking Techniques", pts: "10 pts", img: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=300&q=80", href: "#" },
  { title: "15 Fruit & Vegetable Staples", pts: "10 pts", img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80", href: "#" },
];

const upcomingEvents = [
  { title: "Eat, Think, Thrive MIND Challenge", pts: "50 pts", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&q=80" },
  { title: "UCCS Wellness Workshop: Flourish", pts: "50 pts", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b6f81?w=300&q=80" },
  { title: "HealthYou Coach's Corner: Mediterranean Magic", pts: "45 pts", img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&q=80" },
];

export default function FoodMoodPage() {
  return (
    <div>
      <div className="px-6 py-2 text-xs text-gray-500 border-b">
        <Link href="/legacy/" className="hover:underline">Home</Link> &rsaquo; <Link href="/legacy/body" className="hover:underline">Body</Link> &rsaquo; Food & Mood Resources
      </div>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-1">Food & Mood Resources</h1>
        <p className="text-blue-600 text-sm mb-6">Explore these point accruing resources to help you flourish in emotional nutrition.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {resources.map((r) => (
            <Link key={r.title} href={r.href} className="relative h-36 rounded overflow-hidden group shadow block">
              <img src={r.img} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-0 left-0 p-3">
                <p className="text-white font-semibold text-xs">{r.title}</p>
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded mt-1 inline-block">{r.pts}</span>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-blue-600 text-sm font-semibold mb-4 text-center">Stay Tuned for Upcoming Events!</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {upcomingEvents.map((ev) => (
            <div key={ev.title} className="relative h-36 rounded overflow-hidden shadow">
              <img src={ev.img} alt={ev.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-0 left-0 p-3">
                <p className="text-white font-semibold text-xs">{ev.title}</p>
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded mt-1 inline-block">{ev.pts}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-t pt-4">
          {["Getting Started", "My Benefits", "For Tracking", "Education and Tools"].map((item) => (
            <a key={item} href="#" className="text-center text-xs text-blue-700 hover:underline py-1">{item}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
