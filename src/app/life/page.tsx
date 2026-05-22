import Link from "next/link";

const pillars = [
  {
    title: "Career",
    color: "bg-blue-700",
    topics: ["Workplace Relations", "Career Planning", "Business Skills", "Leadership"],
    description: "Occupational wellness means you find ways to make your work interesting and meaningful. You seek out opportunities to learn new skills. You have a supportive work environment and engage positively with coworkers and the population you serve.",
  },
  {
    title: "Financial",
    color: "bg-blue-600",
    topics: ["Debt Management", "Retirement", "Investments", "Budget"],
    description: "Financial wellness means you are living within your budget and taking steps to plan for your financial future. You have the resources to meet your needs and are able to meet your basic needs plus have some extra for leisure activities you enjoy.",
  },
  {
    title: "Social",
    color: "bg-blue-500",
    topics: ["Home Environment", "Leisure Time", "Community", "Family & Friends"],
    description: "Social wellbeing refers to having a social network that can provide support and guidance when you are struggling. You have close relationships and people to enjoy activities and special occasions with. You also feel safe and comfortable in your home environment.",
  },
];

const articles = {
  Career: ["Finding a Mentor", "How to Master Your Cost of Self Reflection", "How to Improve Your Work/Life Balance"],
  Financial: ["Why an Emergency Fund Should be a Priority", "What are Certificates of Deposit and How do They Work?", "3 Ways to Eliminate Debt Fast"],
  Social: ["Encouraging Someones to Start Saving Today", "Find an Accountability Partner", "Tips on Working with Coworkers with Disabilities"],
};

const activities = [
  { title: "City Employee Development Programs", points: "50 Points", href: "#" },
  { title: "Financial Wellbeing Personal Program", points: "25 Points", href: "#" },
  { title: "Build Your Own Self-Paced Challenge", points: "25 Points Each", href: "/challenges" },
  { title: "Office Ergonomics Personal Program", points: "15 Points", href: "#" },
  { title: "Vendor Webinars", points: "10 Points Each", href: "#" },
  { title: "Community Action CO8", points: "50 Points Each", href: "#" },
  { title: "Online Life Self Assessments", points: "10 Points", href: "#" },
  { title: "Fresh Start Finance Self-Paced Challenge", points: "25 Points", href: "#" },
  { title: "City 5K Walk/Run", points: "25 Points", href: "#" },
];

export default function LifePage() {
  return (
    <div>
      <div
        className="relative bg-cover bg-center h-48 flex flex-col items-center justify-center text-white text-center px-4"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold">Goal Path: Life</h1>
          <p className="text-lg mt-1">Career | Financial | Social</p>
          <p className="text-sm mt-2 max-w-2xl mx-auto opacity-90">
            Life is about ensuring you meet your financial goals, having a good life balance, continuing your life-long learning and being engaged in cultural wellness.
          </p>
        </div>
      </div>

      <div className="px-6 py-2 text-xs text-gray-500 border-b">
        <Link href="/" className="hover:underline">Home</Link> &rsaquo; Life
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
        <h2 className="text-xl font-bold text-blue-800 mb-1">Life: Expand Your Awareness</h2>
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
        <h2 className="text-xl font-bold text-blue-800 mb-4">Life: Make a Change</h2>
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
        <h2 className="text-xl font-bold text-blue-800 mb-4">LIFE: Coaches Corner — <span className="text-blue-600 font-normal text-base">Click to View More!</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded overflow-hidden shadow">
            <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80" alt="Social Side of Wellness" className="w-full h-40 object-cover" />
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">The Social Side of Wellness</p>
                <p className="text-xs text-gray-500">Thursday, January 29 · 12 noon</p>
              </div>
              <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700">Register Here</button>
            </div>
          </div>
          <div className="border rounded overflow-hidden shadow">
            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80" alt="Quality of Life" className="w-full h-40 object-cover" />
            <div className="p-3">
              <p className="font-bold text-sm">Quality of Life — Pre-Recorded</p>
              <button className="mt-2 bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700">Watch Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
