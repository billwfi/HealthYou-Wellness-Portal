import TrackSubNav from "@/components/TrackSubNav";

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <TrackSubNav />
      <div className="max-w-6xl mx-auto p-6">{children}</div>
    </div>
  );
}
