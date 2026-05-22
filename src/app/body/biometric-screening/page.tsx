import Link from "next/link";

const schedule = [
  { location: "Police Operations Center", dates: ["Wed April 2nd — 8:00am–1:00pm", "Wed April 9th — 8:00am–1:00pm"] },
  { location: "Hillside Community Center", dates: ["Tue May 5th — 8:00am–12:00pm", "Wed May 27th — 8:00am–12:00pm"] },
  { location: "Fire Dept. Complex West", dates: ["Tue May 12th — 8:00am–12:00pm"] },
  { location: "Police Operations Center (May)", dates: ["Fri May 15th — 8:00am–12:00pm", "Fri May 16th — 8:00am–12:00pm", "Tue May 20th — 8:00am–4:00pm"] },
];

const screeningFactors = [
  "Blood Pressure", "HbA1c (Pre-Diabetes)", "HDL Cholesterol", "LDL Cholesterol",
  "Total Cholesterol", "TC/HDL Ratio", "Triglycerides", "eGFR (Kidney)",
  "Body Size (Waist)", "Blood Glucose", "Metabolic Syndrome", "BMI",
];

const lifestyleFactors = [
  "5+ Servings Fruits/Vegetables a Day",
  "Sleep (7+ hours per 24-hour period)",
  "Physical Activity (moderate intensity weekly + 2 strength days)",
  "Stress (scale of 1–10)",
  "Alcohol Intake (Women: 1 drink/day; Men: 2 drinks/day)",
  "Tobacco or Nicotine Use",
];

const prepChecklist = [
  "Drink plenty of plain water 8 hours prior",
  "Take all medications as prescribed",
  "Keep to your normal medication routine",
  "Wear comfortable clothing",
  "Measurements for waist will be on skin; blood pressure cuff will be on the upper arm",
  "Choose if you want to fast or not",
];

export default function BiometricScreeningPage() {
  return (
    <div>
      <div className="px-6 py-2 text-xs text-gray-500 border-b">
        <Link href="/" className="hover:underline">Home</Link> &rsaquo; <Link href="/body" className="hover:underline">Body</Link> &rsaquo; Biometric Health Screening
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Biometric Health Screening</h1>
        <p className="text-sm text-gray-600 mb-1 font-semibold">Reach Your Peak 22 Screening Locations and Dates through May <span className="font-normal text-gray-400">(second half of screening period)</span></p>
        <p className="text-xs text-gray-500 mb-4">City Employees & Spouses — each must have separate screening appointments.</p>

        <div className="flex justify-end mb-6">
          <button className="bg-red-600 text-white px-5 py-2 rounded font-semibold hover:bg-red-700 text-sm">Schedule Your Free Screening</button>
        </div>

        {/* Schedule */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-8">
          <h2 className="text-lg font-bold text-blue-800 mb-3">2026 Biometric Health Screening Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedule.map((s) => (
              <div key={s.location} className="bg-white border rounded p-3">
                <p className="font-semibold text-blue-700 text-sm mb-1">{s.location}</p>
                {s.dates.map((d) => <p key={d} className="text-xs text-gray-600">• {d}</p>)}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Screenings are by appointment only. Contact HealthYou at 719-314-2535, located at 1675 Ridgeline Drive, Colorado Springs, CO 80921.
          </p>
          <Link href="/body/health-coaching" className="text-blue-600 text-xs hover:underline mt-2 inline-block">Meet Our Health Coaches</Link>
        </div>

        {/* 16 Factors */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-blue-800 mb-3">HealthYou&apos;s 16 Biometric Health Screening Factors Include:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">12 Health Screening Factors</h3>
              <div className="grid grid-cols-2 gap-2">
                {screeningFactors.map((f) => (
                  <div key={f} className="bg-blue-700 text-white text-xs rounded p-2 text-center">{f}</div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">4 Lifestyle Factors</h3>
              <ul className="space-y-1">
                {lifestyleFactors.map((f) => <li key={f} className="text-xs text-gray-700 flex gap-2"><span className="text-blue-600">•</span>{f}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Why Participate */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-blue-800 mb-4">Why Participate in a Health Screening?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Annual Check-Up", desc: "Periodic health screenings look at numbers that can help identify early beginnings of change which could lead to body system breakdown and even disease." },
              { title: "Know Your Numbers", desc: "A comprehensive health screening gives you a closer look at your cholesterol numbers, potential diabetes risk numbers, blood pressure, weight impact, and how other lifestyle habits may affect your health." },
              { title: "Prevention is Key", desc: "A comprehensive health screening and engaging in healthy habits is much more cost effective than treating the disease once it manifests." },
              { title: "Gain Access to Coaches", desc: "Participation in the HealthYou biometric health screening means you have access to a professional health coach for questions about your health numbers, advice, or goals." },
            ].map((item) => (
              <div key={item.title} className="border rounded p-4 bg-gray-50">
                <h3 className="font-bold text-sm text-blue-800 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to Prepare */}
        <div className="bg-gray-50 border rounded p-5">
          <h2 className="text-lg font-bold text-blue-800 mb-3">How to Prepare for Your Health Screening</h2>
          <ul className="space-y-2">
            {prepChecklist.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
