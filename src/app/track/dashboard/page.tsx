"use client";
import { useState } from "react";

const activityCategories = ["Fitness", "Nutrition", "Well-being"] as const;

export default function DashboardPage() {
  const [tab, setTab] = useState<"Activity" | "Biometric">("Activity");
  const [statPeriod, setStatPeriod] = useState<"Today" | "This Week" | "This Month">("Today");
  const [category, setCategory] = useState<(typeof activityCategories)[number]>("Fitness");
  const [form, setForm] = useState({ date: new Date().toLocaleDateString("en-US"), activity: "", amount: "", notes: "" });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Favorites */}
      <div className="border rounded shadow-sm overflow-hidden">
        <div className="bg-blue-700 text-white font-bold text-sm px-4 py-2">Favorites</div>
        <div className="p-4 space-y-3">
          <label className="block text-xs font-semibold text-gray-600">Add Activity to Favorites</label>
          <select className="w-full border rounded px-3 py-2 text-sm">
            <option value="">Select Activities</option>
            <option>Walking</option>
            <option>Running</option>
            <option>Yoga</option>
            <option>Cycling</option>
            <option>Swimming</option>
          </select>
          <div className="flex gap-2">
            <button className="bg-gray-400 text-white text-xs px-3 py-1.5 rounded hover:bg-gray-500">Clear</button>
            <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700">Save</button>
          </div>
        </div>
      </div>

      {/* Create Entry */}
      <div className="border rounded shadow-sm overflow-hidden">
        <div className="bg-blue-700 text-white font-bold text-sm px-4 py-2">Create Your Entries</div>
        <div className="p-4">
          <div className="flex gap-4 mb-4 border-b">
            {(["Activity", "Biometric"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-2 text-sm font-medium border-b-2 -mb-px ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Activity" ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Activity Date</label>
                <input type="date" className="w-full border rounded px-3 py-2 text-sm" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Filter by</label>
                <div className="flex gap-4">
                  {activityCategories.map((c) => (
                    <label key={c} className="flex items-center gap-1 text-xs cursor-pointer">
                      <input type="radio" name="category" checked={category === c} onChange={() => setCategory(c)} />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Activity</label>
                <select className="w-full border rounded px-3 py-2 text-sm">
                  <option value="">Please Select...</option>
                  <option>Walking (steps)</option>
                  <option>Running</option>
                  <option>Cycling</option>
                  <option>Yoga</option>
                  <option>Swimming</option>
                  <option>Strength Training</option>
                  <option>Wellness Articles A-Z</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Amount</label>
                <input type="number" min={0} className="w-full border rounded px-3 py-2 text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
                <textarea className="w-full border rounded px-3 py-2 text-sm h-16 resize-none" />
              </div>
              <div className="flex gap-2">
                <button className="bg-gray-500 text-white text-xs px-4 py-1.5 rounded hover:bg-gray-600">Clear</button>
                <button className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded hover:bg-blue-700">Save</button>
              </div>
              <p className="text-xs text-gray-400">Note: Entries are applied towards challenges on intervals up to fifteen minutes. Please allow this allotted time for your entries to be reflected.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Entry Date</label>
                <input type="date" className="w-full border rounded px-3 py-2 text-sm" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Biometric Type</label>
                <select className="w-full border rounded px-3 py-2 text-sm">
                  <option value="">Please Select...</option>
                  <option>Blood Pressure</option>
                  <option>Weight</option>
                  <option>BMI</option>
                  <option>Blood Glucose</option>
                  <option>Cholesterol</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Value</label>
                <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. 120/80" />
              </div>
              <div className="flex gap-2">
                <button className="bg-gray-500 text-white text-xs px-4 py-1.5 rounded hover:bg-gray-600">Clear</button>
                <button className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded hover:bg-blue-700">Save</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Stats */}
      <div className="border rounded shadow-sm overflow-hidden">
        <div className="bg-blue-700 text-white font-bold text-sm px-4 py-2">My Key Stats</div>
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            {(["Today", "This Week", "This Month"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setStatPeriod(p)}
                className={`text-xs px-2 py-1 rounded ${statPeriod === p ? "bg-blue-600 text-white" : "text-blue-600 hover:bg-blue-50"}`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[{ label: "Steps", val: 0 }, { label: "Minutes", val: 0 }, { label: "Points", val: 0 }].map((s) => (
              <div key={s.label} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full border-4 border-gray-200 flex items-center justify-center text-blue-600 text-xl font-bold">
                  {s.val}
                </div>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-gray-500">
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Key stats are based on daily values: 10,000 steps, 30 minutes, and 100 fitness points.
          </p>
          <a href="#" className="text-xs text-blue-600 hover:underline block text-center mt-1">Click here to edit your daily goals</a>
        </div>
      </div>
    </div>
  );
}
