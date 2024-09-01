import dynamic from "next/dynamic";

const DynamicHomeContent = dynamic(() => import("../components/HomeContent"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <main className="text-center">
        <h1 className="text-4xl font-bold mb-8">
          Campus Services Management System
        </h1>
        <DynamicHomeContent />
      </main>
    </div>
  );
}
