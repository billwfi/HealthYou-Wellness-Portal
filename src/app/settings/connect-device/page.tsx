"use client";
import { useState } from "react";
import Link from "next/link";

const devices = [
  { name: "Android", desc: "Coaching you to a healthier and more active life.", logo: "🤖" },
  { name: "Apple", desc: "Apple's Health app makes it easy to learn about your health and start reaching your goals.", logo: "🍎" },
  { name: "Fitbit", desc: "Makes every step you take a step toward better fitness, even on your busiest days.", logo: "⌚" },
  { name: "Garmin", desc: "Records every step you take on Garmin Connect.", logo: "🏃" },
  { name: "Google Fit", desc: "Coaching you to a healthier and more active life.", logo: "G" },
  { name: "RunKeeper", desc: "Best way to track your fitness data. Track outdoor activities using your mobile device's GPS or enter workout information from indoor activities manually.", logo: "🏅" },
];

const deviceGuides = [
  { name: "Apple Watch", img: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=200&q=80" },
  { name: "Apple Health App", img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&q=80" },
  { name: "Android Health Connect App", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80" },
  { name: "Garmin Devices", img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200&q=80" },
  { name: "Fitbit Devices", img: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=200&q=80" },
  { name: "Fitbit App", img: "https://images.unsplash.com/photo-1551729638-98432be72def?w=200&q=80" },
];

export default function ConnectDevicePage() {
  const [selected, setSelected] = useState("");

  return (
    <div>
      <div className="px-6 py-2 text-xs text-gray-500 border-b">
        <Link href="/" className="hover:underline">Home</Link> &rsaquo; Settings &rsaquo; Connect Your Device or Health App
      </div>
      <div className="max-w-5xl mx-auto p-6">
        {/* Fitbit Alert */}
        <div className="bg-orange-50 border border-orange-300 rounded p-4 mb-6">
          <h2 className="font-bold text-orange-800 text-sm mb-2">Important announcement for Fitbit users!</h2>
          <p className="text-xs text-gray-700 mb-1">Fitbit is now part of Google, which means all Fitbit users will need to transition to a Google Account or risk losing your Fitbit history as it is recorded in your Fitbit app.</p>
          <p className="text-xs text-gray-700 mb-1">If you sign in to Fitbit with a Gmail account, you will also need to move to a Google Account.</p>
          <p className="text-xs text-gray-700 mb-3">If your Fitbit is synced to the Wellness Portal, any data that has been recorded in the portal will not be lost. To make the switch, open the Fitbit app, go to settings, and follow the steps to link your Google Account.</p>
          <a href="#" className="bg-red-600 text-white text-xs px-3 py-1.5 rounded hover:bg-red-700 inline-block">Learn more at the Fitbit Help Center</a>
        </div>

        <p className="text-xs text-gray-500 mb-1">After setting up a connection, <a href="/track/activities" className="text-blue-600 hover:underline">View Activity Entries</a> to verify the activities are showing.</p>
        <p className="text-xs text-gray-500 mb-6">Note: If your device is in a low battery or power-saving mode your steps may not come in from the device without a manual sync, or syncing may be slowed down.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device List */}
          <div>
            <h2 className="text-sm font-bold text-gray-600 mb-3">Available Devices and Apps</h2>
            <div className="space-y-3">
              {devices.map((d) => (
                <div key={d.name} className="border rounded p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{d.logo}</span>
                    <div>
                      <p className="font-semibold text-sm">{d.name}</p>
                      <p className="text-xs text-red-500 font-medium">Status: Disconnected</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{d.desc}</p>
                  <label className="flex items-center gap-1 text-xs text-gray-500 mb-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    Check to agree to the <a href="#" className="text-blue-600 hover:underline">Device and App Integration Policy</a>
                  </label>
                  <button className="bg-gray-400 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-600 transition-colors w-full">
                    Connect to {d.name}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-step guide */}
          <div>
            <h2 className="text-sm font-bold text-gray-600 mb-3">Step-by-Step Connection Instructions</h2>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm mb-4"
            >
              <option value="">Choose Device or App</option>
              {deviceGuides.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
            </select>
            <p className="text-xs text-gray-500 mb-4">The following devices and applications can be connected to automatically create activity entries in the tracker. Select a device or app for step-by-step connection instructions.</p>
            <div className="grid grid-cols-2 gap-3">
              {deviceGuides.map((g) => (
                <button
                  key={g.name}
                  onClick={() => setSelected(g.name)}
                  className={`border rounded overflow-hidden text-center hover:border-blue-500 transition-colors ${selected === g.name ? "border-blue-500 ring-2 ring-blue-300" : ""}`}
                >
                  <img src={g.img} alt={g.name} className="w-full h-20 object-cover" />
                  <p className="text-xs py-1 px-1 font-medium">{g.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
