import Link from "next/link";

const faqs = [
  "How to Set a Private Goal",
  "How to Create an Individual Private Challenge",
  "How to Create or Join Private Teams",
  "How to Create a Team Private Challenge",
  "How to Change a Team Captain",
  "How to Enter a Team in a Public Challenge",
  "How to Send Private Individual and Team Messages",
  "Download the User Guide to Private Teaming",
];

export default function ChallengesPage() {
  return (
    <div>
      <div className="px-6 py-2 text-xs text-gray-500 border-b">
        <Link href="/" className="hover:underline">Home</Link> &rsaquo; Challenges
      </div>
      <div className="max-w-5xl mx-auto p-6">
        {/* Featured Challenge Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded p-6 flex flex-col justify-between">
            <div>
              <span className="bg-blue-700 text-white text-xs px-2 py-0.5 rounded mb-2 inline-block">RYP22 Incentive Group Challenge #2</span>
              <h2 className="text-2xl font-bold text-gray-800 mt-2">Eat, Think, <em>THRIVE</em><br />Mind Challenge</h2>
              <div className="flex gap-6 mt-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Registration Open</p>
                  <p className="font-semibold text-red-600">May 11 – 25</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Challenge Open</p>
                  <p className="font-semibold text-red-600">May 11 – June 22</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-green-100 border border-green-300 rounded p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-bold text-green-800">Eat, Think, THRIVE<br />Mind Challenge RYP22</h3>
            <Link href="#" className="mt-4 bg-blue-700 text-white px-4 py-2 rounded text-sm hover:bg-blue-800">
              Registration / Challenge Content
            </Link>
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { title: "Rate Your Challenge", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" },
            { title: "Guided Workouts", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
            { title: "Propel Personal Programs", href: "/content", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b6f81?w=400&q=80" },
          ].map((item) => (
            <Link key={item.title} href={(item as { href?: string }).href ?? "#"} className="relative h-36 rounded overflow-hidden group shadow block">
              <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/40" />
              <span className="absolute bottom-3 left-3 text-white font-semibold text-sm">{item.title}</span>
            </Link>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div>
          <h2 className="text-lg font-bold text-blue-800 mb-3">Frequently Asked Questions</h2>
          <div className="border rounded overflow-hidden">
            {faqs.map((faq, i) => (
              <details key={i} className="group border-b last:border-0">
                <summary className="flex items-center justify-between px-4 py-3 bg-gray-700 text-white text-sm cursor-pointer hover:bg-gray-800 list-none">
                  <span className="flex items-center gap-2">
                    <svg className="w-3 h-3 group-open:rotate-90 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {faq}
                  </span>
                </summary>
                <div className="px-4 py-3 text-sm text-gray-600 bg-white">
                  Contact your wellness program administrator for detailed instructions on this topic.
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
