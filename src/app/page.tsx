import dynamic from "next/dynamic";

// Lazy load Postlist component with loading fallback
const Postlist = dynamic(() => import("@/components/Postlist"), {
  ssr: true,
  loading: () => (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-500 mx-auto mb-6" />
          <p className="text-xl text-gray-300">Loading...</p>
        </div>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return (
    <main>
      <Postlist />
    </main>
  );
}
