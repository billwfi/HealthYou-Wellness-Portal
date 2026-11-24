import Link from "next/link";

const modules = [
  { title: "Personal Programs", desc: "Go deeper with multi-module, self-paced programs on topics like financial well-being, mindfulness, resilience and more.", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b6f81?w=400&q=80", href: "#" },
  { title: "Mindful Moment Series", desc: "Find peace with bite-sized moments of meditation that will help you reset and refocus.", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80", href: "#" },
  { title: "Virtual Kitchen", desc: "Find your next healthy meal in our library of nutritious meals, snacks, drinks and desserts.", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80", href: "#" },
  { title: "Propel Podcast", desc: "Learn from experts as they explore topics across the well-being spectrum.", img: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=80", href: "#" },
  { title: "Propel Studio", desc: "Get your heart rate up and build strength with a library of guided workouts.", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", href: "#" },
];

const categories = [
  { title: "Mental Health Articles", img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80" },
  { title: "Physical Health Articles", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { title: "Financial Well-being Articles", img: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=400&q=80" },
  { title: "Nutrition Articles", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80" },
  { title: "Social and Emotional Well-being Articles", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80" },
  { title: "Workplace Well-being Articles", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80" },
];

export default function ContentPage() {
  return (
    <div>
      <div className="px-6 py-2 text-xs text-gray-500 border-b">
        <Link href="/legacy/" className="hover:underline">Home</Link> &rsaquo; Content
      </div>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-6">Content</h1>

        {/* Hero Carousel (static 2-panel) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative rounded overflow-hidden h-44 shadow">
            <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80" alt="Recipe" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-4">
              <h3 className="text-white font-bold text-sm">A Better-for-You Treat in Minutes</h3>
              <p className="text-gray-300 text-xs mb-2">Craving something sweet? These apple cinnamon bars are quick to make and worth every bite.</p>
              <button className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700 w-fit">Get the Recipe</button>
            </div>
          </div>
          <div className="relative rounded overflow-hidden h-44 shadow">
            <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80" alt="What's New" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-4">
              <h3 className="text-white font-bold text-sm">What&apos;s New</h3>
              <p className="text-gray-300 text-xs">Explore the latest content releases across all available features, all on one page for easy navigation.</p>
            </div>
          </div>
        </div>

        {/* Content Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {modules.map((mod) => (
            <Link key={mod.title} href={mod.href} className="flex gap-3 border rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow p-3">
              <img src={mod.img} alt={mod.title} className="w-24 h-20 object-cover rounded shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-blue-800">{mod.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{mod.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Well-being Categories */}
        <h2 className="text-lg font-bold text-blue-800 mb-4">Explore Well-being Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <a key={cat.title} href="#" className="relative h-32 rounded overflow-hidden group shadow block">
              <img src={cat.img} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/40" />
              <span className="absolute bottom-3 left-3 text-white font-semibold text-xs">{cat.title}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
