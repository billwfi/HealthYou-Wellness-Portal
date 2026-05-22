import Link from "next/link";

const coaches = [
  { name: "Christine Kademia", creds: "MPH, CPT, NSCA", bio: "Christine has been a personal trainer for over 12 years with the National Strength and Conditioning Association. She earned her Master of Public Health Degree at The Ohio State University in 2003 and has been working in worksites with people individually to make health improvements." },
  { name: "Jean Ann Reid", creds: "RDN", bio: "Jean Ann is a Registered Dietitian, born and raised in Kansas, graduated from Kansas State University with a Bachelor of Science degree in Dietetics and a Master's in Institutional Management. She has over 10 years experience in both clinical and management positions." },
  { name: "Mary Ward", creds: "MS, CWHC", bio: "Mary completed her Master's in Health Promotion at University of Colorado Colorado Springs. This graduate degree is like a master's step as it bridges beginning from student to full grade driver, for her undergraduate and graduate degree, she has been assisting with her reading project." },
  { name: "Alison Hochter", creds: "M.S., NBC-HWC", bio: "Alison is a National Board Certified Health and Wellness Coach with a passion for promoting healthy lifestyles. She holds a Master's degree in Public Health with a concentration in nutrition from Tufts University and a Bachelor's degree in Psychology from UNC Wilmington." },
  { name: "Marcia Cassidy", creds: "BSN, RN", bio: "" },
  { name: "Kelly Gracefken", creds: "RDN", bio: "" },
  { name: "Austin Hochkell", creds: "CWC", bio: "" },
  { name: "Erin Nath", creds: "MS, NBC-HWC, CHWC, CSCS", bio: "" },
  { name: "Lina Sierra", creds: "NBC-HWC, CSC", bio: "" },
  { name: "Anthony Hoefs", creds: "BS, MA", bio: "" },
  { name: "Rebecca Larson", creds: "BS, NBC-HWC", bio: "" },
  { name: "Lynnette Evans", creds: "BSN, CPT", bio: "" },
];

export default function HealthCoachingPage() {
  return (
    <div>
      <div
        className="relative bg-cover bg-center h-40 flex items-center justify-center text-white text-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="relative z-10 text-3xl font-bold">Health Coaching for City Employees</h1>
      </div>

      <div className="px-6 py-2 text-xs text-gray-500 border-b">
        <Link href="/" className="hover:underline">Home</Link> &rsaquo; <Link href="/life" className="hover:underline">Life</Link> &rsaquo; HealthYou &rsaquo; Health Coaching for City Employees
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <p className="text-sm text-gray-700 mb-3">
              What could be more rewarding than feeling great? How about learning new ways to boost your energy, improve your health, and put some extra money in your pocket with the Reach Your Peak incentive program?
            </p>
            <p className="text-sm text-gray-700 mb-3">
              Our Health Coaches are trained nurses, dietitians, exercise physiologists, dietitians or have expertise in other health disciplines. Your health coach will help transition you through a process of understanding your health issues and will work with you to establish a program to help you achieve positive changes in your overall health and quality of life.
            </p>
            <p className="text-sm text-gray-700">We hope that in 2026, you will consider what a meeting with a health coach can do for you.</p>
          </div>
          <div className="border rounded p-4 bg-blue-50 flex flex-col items-center justify-center text-center">
            <p className="font-bold text-blue-800 mb-3">Schedule a call with a health coach today!</p>
            <button className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 font-semibold">Schedule Now</button>
          </div>
        </div>

        <h2 className="text-xl font-bold text-blue-800 mb-6 border-b pb-2">Meet our City of Colorado Springs Health Coaching Team for 2026</h2>

        <div className="space-y-6">
          {coaches.map((coach) => (
            <div key={coach.name} className="flex gap-4 border-b pb-6">
              <div className="w-24 h-24 bg-blue-200 rounded-full shrink-0 flex items-center justify-center text-blue-700 font-bold text-xl">
                {coach.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div className="bg-blue-700 text-white inline-block px-3 py-0.5 rounded text-sm font-semibold mb-1">{coach.name}</div>
                <p className="text-xs text-blue-600 font-medium mb-1">{coach.creds}</p>
                {coach.bio && <p className="text-sm text-gray-600">{coach.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
