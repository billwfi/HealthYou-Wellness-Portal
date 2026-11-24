import Link from "next/link";

const pillars = [
  {
    title: "Emotional Health",
    color: "bg-blue-700",
    topics: ["Connections", "Mindfulness", "Stress Levels", "Coping Mechanisms"],
    description: "Emotional wellness means you have strategies in place to manage and express your emotions. You are able to put day to day problems into perspective and focus on the positive things in your life. You are aware of and practice mindfulness exercises where you are fully engaged in the present.",
  },
  {
    title: "Resiliency & Balance",
    color: "bg-blue-600",
    topics: ["Hobbies", "Mindset", "Helping Others", "Work/Life Balance"],
    description: "This means you feel that you have a good work/life balance. You have the resources and take the time to engage in activities that you enjoy. You take opportunities to volunteer or give back in your community or to causes that are important to you.",
  },
  {
    title: "Personal Growth",
    color: "bg-blue-500",
    topics: ["Curiosity", "Learning", "Creativity", "Awareness"],
    description: "Good self-care means you take time to reflect on the beliefs, values and ethics that guide your life. You stay curious and engaged in learning new things and you are aware of social and political issues going on around you and more broadly.",
  },
];

const articles = {
  "Emotional Health": ["3 Ways to Deflect or Modify Stress", "Tips for Breaking Your Phone Addiction", "Quick Tips for Talking with Your Doctor About Depression"],
  "Resilience and Balance": ["How to Identify Your Purpose", "Why Self-Care is Not Selfish", "Time Management"],
  "Personal Growth": ["5 Small Ways to Improve Your Career Everyday", "Setting S.M.A.R.T Goals", "How to Overcome a Creative Block"],
};

const activities = [
  { title: "Vendor Webinars", points: "15 Points Each", href: "#" },
  { title: "Resiliency Personal Program", points: "25 Points", href: "#" },
  { title: "UCCS Programs", points: "30 Points Each", href: "/legacy/body/uccs-programs" },
  { title: "Still Waters Self-Paced Challenge", points: "25 Points", href: "/legacy/challenges" },
  { title: "Online Mental Health Assessments", points: "10 Points", href: "#" },
  { title: "Build Your Own Self-Paced Challenge", points: "25 Points Each", href: "/legacy/challenges" },
  { title: "Mindfulness Personal Program", points: "25 Points", href: "#" },
  { title: "Caregiver Well-Being Personal Program", points: "25 Points", href: "#" },
  { title: "Peak Moments", points: "15 Points", href: "#" },
];

export default function MindPage() {
  return (
    <div>
      <div
        className="relative bg-cover bg-center h-48 flex flex-col items-center justify-center text-white text-center px-4"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold">Goal Path: Mind</h1>
          <p className="text-lg mt-1">Emotional Health | Resilience and Balance | Personal Growth</p>
          <p className="text-sm mt-2 max-w-2xl mx-auto opacity-90">
            Mind promotes having the emotional wellness to understand and accept feelings; to intellectually find ways to expand your knowledge and skills.
          </p>
        </div>
      </div>

      <div className="px-6 py-2 text-xs text-gray-500 border-b">
        <Link href="/legacy/" className="hover:underline">Home</Link> &rsaquo; Mind
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 max-w-6xl mx-auto">
        {pillars.map((p) => (
          <div key={p.title} className="border rounded overflow-hidden shadow-sm">
            <div className={`${p.color} text-white text-center py-2 font-bold`}>{p.title}</div>
            <div className="p-4 bg-gray-50">
              <ul className="text-sm text-gray-700 list-disc pl-4 mb-3">
                {p.topics.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <p className="text-xs text-gray-600">{p.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 max-w-6xl mx-auto pb-4">
        <h2 className="text-xl font-bold text-blue-800 mb-1">Mind: Expand Your Awareness</h2>
        <p className="text-sm text-gray-600 mb-4">Wellness Articles A-Z (100 points each, max 100 points total across all Mind, Body, Life categories).</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(articles).map(([cat, links]) => (
            <div key={cat} className="bg-blue-700 text-white rounded p-4">
              <h3 className="font-bold mb-2 text-sm">{cat}</h3>
              <ul className="space-y-1">
                {links.map((l) => <li key={l}><a href="#" className="text-xs underline hover:text-blue-200">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 max-w-6xl mx-auto pb-8">
        <h2 className="text-xl font-bold text-blue-800 mb-4">Mind: Make a Change</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {activities.map((act) => (
            <Link key={act.title} href={act.href} className="relative h-36 bg-gray-200 rounded overflow-hidden group shadow">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3">
                <p className="text-white font-semibold text-sm">{act.title}</p>
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded mt-1 inline-block">{act.points}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="px-6 max-w-6xl mx-auto pb-8">
        <h2 className="text-xl font-bold text-blue-800 mb-4">MIND: Coaches Corner — <span className="text-blue-600 font-normal text-base">Click to View More!</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded overflow-hidden shadow">
            <img src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=80" alt="You Can't Pour from an Empty Cup" className="w-full h-40 object-cover" />
            <div className="p-3">
              <p className="font-bold text-sm">You Can&apos;t Pour from an Empty Cup</p>
            </div>
          </div>
          <div className="border rounded overflow-hidden shadow">
            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80" alt="What's Your Why?" className="w-full h-40 object-cover" />
            <div className="p-3">
              <p className="font-bold text-sm">What&apos;s Your Why?</p>
              <button className="mt-2 bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700">Watch Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
