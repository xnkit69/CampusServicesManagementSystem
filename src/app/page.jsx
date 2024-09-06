import HomeContent from "@/components/HomeContent";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <main className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-4xl font-bold mb-8 text-primary">
          Campus Services Management System
        </h1>
        <HomeContent />
      </main>
    </div>
  );
}
