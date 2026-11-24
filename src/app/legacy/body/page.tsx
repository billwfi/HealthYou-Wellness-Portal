import Link from "next/link";

const pillars = [
  {
    title: "Nutrition",
    color: "bg-blue-700",
    topics: ["Meal Preparation", "Healthy Weight", "Balanced Meals", "Meal Planning"],
    description: "Nutritional wellness refers to eating balanced meals at least 80% of the time and finding portion sizes to maintain a healthy weight. You strive to eat fresh, healthy, unprocessed foods and the knowledge and time to prepare these foods.",
  },
  {
    title: "Physical Activity",
    color: "bg-blue-600",
    topics: ["Strength Training", "Daily Movement", "Flexibility", "Cardio"],
    description: "Physical Activity means you incorporate at least 30 minutes of activity into your daily routine on most days. You have a variety of different activities you enjoy that engage different muscle groups, prevent boredom, and prevent boredom. You have access to safe places to exercise like gyms, sidewalks, trails and parks.",
  },
  {
    title: "Self-Care",
    color: "bg-blue-500",
    topics: ["Medication Adherence", "Healthcare Visits", "Quality Sleep", "Grooming"],
    description: "Good self-care means you make sleep a priority and practice good sleep hygiene. You take time for grooming and take pride in your personal appearance. You are aware of the different preventative exams you need and schedule and attend recommended healthcare visits.",
  },
];

const articles = {
  Nutrition: ["Make My Plate a Healthy Plate", "Healthy Cooking Techniques You Should Know", "45 Simple Fruits and Vegetables You Need"],
  "Physical Activity": ["10 Ways to Get a Weekday Workout", "Tips for Strength Training", "Exercise is Medicine"],
  "Self-Care": ["Tips for Drinking More Water", "Best Practices for a Healthy Mouth", "Why Are Preventative Health Screenings Important"],
};

const activities = [
  { title: "UCCS Cooking Classes", points: "30 Points", href: "/legacy/body/uccs-programs" },
  { title: "UCCS Personal Training", points: "50 Points Each", href: "/legacy/body/uccs-programs" },
  { title: "Sleep Management Personal Program", points: "55 Points", href: "#" },
  { title: "Online Body Self Assessments", points: "10 Points", href: "#" },
  { title: "Build Your Own Self-Paced Challenge", points: "25 Points Each", href: "/legacy/challenges" },
  { title: "City Health Management Programs", points: "50 Points Each", href: "#" },
  { title: "Weight Management Personal Program", points: "45 Points", href: "#" },
  { title: "Intro to Physical Activity Personal Program", points: "25 Points", href: "#" },
  { title: "Preventative Exams", points: "45 Points", href: "#" },
];

export default function BodyPage() {
  return (
    <div>
      {/* Hero */}
      <div
        className="relative bg-cover bg-center h-48 flex flex-col items-center justify-center text-white text-center px-4"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold">Goal Path: Body</h1>
          <p className="text-lg mt-1">Nutrition | Physical Activity | Self-Care</p>
          <p className="text-sm mt-2 max-w-2xl mx-auto opacity-90">
            Body encourages physical wellness and promotes proper care of our bodies for optimal health and functioning.
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-6 py-2 text-xs text-gray-500 border-b">
        <Link href="/legacy/" className="hover:underline">Home</Link> &rsaquo; Body
      </div>

      {/* Pillars */}
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

      {/* Expand Your Awareness */}
      <div className="px-6 max-w-6xl mx-auto pb-4">
        <h2 className="text-xl font-bold text-blue-800 mb-1">Body: Expand Your Awareness</h2>
        <p className="text-sm text-gray-600 mb-1">Wellness Articles A-Z (100 points each, max 100 points total across all Mind, Body, Life categories).</p>
        <p className="text-xs text-gray-500 mb-4">Discover helpful education and tools below to strengthen your physical well-being. Self-report in Tracker Dashboard tab select Wellness Articles A-Z.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(articles).map(([cat, links]) => (
            <div key={cat} className="bg-blue-700 text-white rounded p-4">
              <h3 className="font-bold mb-2 text-sm">{cat}</h3>
              <ul className="space-y-1">
                {links.map((l) => (
                  <li key={l}><a href="#" className="text-xs underline hover:text-blue-200">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Make a Change */}
      <div className="px-6 max-w-6xl mx-auto pb-8">
        <h2 className="text-xl font-bold text-blue-800 mb-4">Body: Make a Change</h2>
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

      {/* Coaches Corner */}
      <div className="px-6 max-w-6xl mx-auto pb-8">
        <h2 className="text-xl font-bold text-blue-800 mb-4">BODY: Coaches Corner — <Link href="/legacy/body/health-coaching" className="text-blue-600 hover:underline text-base font-normal">Click to View More!</Link></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded overflow-hidden shadow">
            <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80" alt="Mediterranean Magic" className="w-full h-40 object-cover" />
            <div className="p-3">
              <p className="font-bold text-sm">Mediterranean Magic</p>
              <p className="text-xs text-gray-500">Monday, August 31 · 12 noon</p>
            </div>
          </div>
          <div className="border rounded overflow-hidden shadow">
            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80" alt="Mindful Eating" className="w-full h-40 object-cover" />
            <div className="p-3">
              <p className="font-bold text-sm">Mindful Eating — Pre-Recorded</p>
              <p className="text-xs text-gray-500">Coach: Erin Koch</p>
              <button className="mt-2 bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700">Watch Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
