import Link from "next/link";

export default function UCCSProgramsPage() {
  return (
    <div>
      <div
        className="relative bg-cover bg-center h-40 flex items-center justify-center text-white"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="relative z-10 text-3xl font-bold">UCCS Programs</h1>
      </div>
      <div className="px-6 py-2 text-xs text-gray-500 border-b">
        <Link href="/" className="hover:underline">Home</Link> &rsaquo; <Link href="/body" className="hover:underline">Body</Link> &rsaquo; UCCS Wellness Program
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Testimonial */}
        <div className="bg-gray-50 border rounded p-4 italic text-sm text-gray-700">
          &ldquo;As my first experience doing personal training, Reva has been awesome! I have grown so much in my physical health and confidence. Not only does she push you to do your best, she is very patient when I struggle. I look forward to working with her on my health journey.&rdquo;
          <p className="mt-2 text-xs font-semibold not-italic text-gray-500">— Nancy T.</p>
        </div>

        {/* Cooking Classes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
          <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80" alt="Cooking Classes" className="rounded h-44 w-full object-cover" />
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-blue-800 mb-1">Cooking Classes:</h2>
            <p className="text-sm text-gray-700 mb-2">
              Elevate your culinary skills! Join us in-person at the UCCS Lane Center Kitchen located off North Nevada Avenue to learn new recipes and meet new people. The UCCS cooking classes are designed to provide you with quick, easy, and healthy meals that can help fuel your work week and keep you at your peak performance.
            </p>
            <ul className="text-xs text-gray-600 list-disc pl-4 mb-3 space-y-1">
              <li>Participate in up to 4 cooking classes per RYP program year</li>
              <li>1 cooking class = 1 UCCS program; Earn <strong>20 automated points</strong> per class</li>
              <li>Eligible spouses and domestic partners welcome to attend</li>
            </ul>
            <a href="#" className="text-blue-600 text-sm hover:underline font-medium">Elevate Your Plate — April 16 &rsaquo;</a>
          </div>
        </div>

        {/* Personal Training */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
          <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" alt="Personal Training" className="rounded h-44 w-full object-cover" />
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-blue-800 mb-1">Personal or Partner Training:</h2>
            <p className="text-sm text-gray-700 mb-2">
              Customized Fitness Training! Whether you are looking to get back into a movement routine or training for your next race, our trainers will meet you where you are in your journey for FREE. Eligible spouses or City employees can take advantage of our partner training sessions.
            </p>
            <ul className="text-xs text-gray-600 list-disc pl-4 mb-3 space-y-1">
              <li>Participate in up to 16 sessions per RYP program year</li>
              <li>Earn <strong>20 automated points</strong> per completed UCCS program</li>
              <li>Schedule: email citylife@UCCS.edu; each session is 1 hour; workouts are customized</li>
            </ul>
            <div className="flex gap-3">
              <a href="#" className="text-blue-600 text-sm hover:underline font-medium">Register for Fitness Training</a>
              <a href="#" className="text-blue-600 text-sm hover:underline font-medium">Meet the UCCS Trainers</a>
            </div>
          </div>
        </div>

        {/* Group Fitness */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
          <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80" alt="Group Fitness" className="rounded h-44 w-full object-cover" />
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-blue-800 mb-1">Group Fitness:</h2>
            <p className="text-sm text-gray-700 mb-2">
              Move your body and build your strength! This year we will offer two (2) group fitness opportunities. Virtual DanceSize each week in the month of February and group yoga in September. Keep your eye out for more information on ways to keep your body loose, limber, and strong!
            </p>
            <ul className="text-xs text-gray-600 list-disc pl-4 mb-3 space-y-1">
              <li>Earn <strong>20 automated points</strong> for each attended session</li>
              <li>Virtual DanceSize was a success! Stay tuned to join group yoga in September</li>
            </ul>
          </div>
        </div>

        {/* Wellness Workshops */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b6f81?w=400&q=80" alt="Wellness Workshops" className="rounded h-44 w-full object-cover" />
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-blue-800 mb-1">Wellness Workshops:</h2>
            <p className="text-sm text-gray-700 mb-2">
              Feed your curiosity! Join us for three (3) lunch and learn wellness workshops to get evidence-based tips and tricks on a variety of health and wellness topics. These are virtual sessions held from 12:00–1:00pm, so you can enjoy your lunch while learning something new.
            </p>
            <ul className="text-xs text-gray-600 list-disc pl-4 mb-3 space-y-1">
              <li>Earn <strong>20 automatic points</strong> per attended workshop</li>
              <li>Participate in as many workshops as offered throughout the program year</li>
            </ul>
            <a href="#" className="text-blue-600 text-sm hover:underline font-medium">Flourishing: June 16 &rsaquo;</a>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700">
          <strong>UCCS Wellness Program Calendar for RYP22</strong> — UCCS programs are free to all benefit eligible City employees and Spouses. For more information email{" "}
          <a href="mailto:citylife@uccs.edu" className="text-blue-600 hover:underline">citylife@uccs.edu</a>.
        </div>
      </div>
    </div>
  );
}
