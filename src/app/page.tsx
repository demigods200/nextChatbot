import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-6 text-[#0078D4]">Welcome to Tipsiti</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your AI-powered guide to discover amazing places, products, people, and cities around you
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="p-6 rounded-lg bg-white shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-3 text-[#0078D4]">Places</h2>
            <p className="text-gray-600">Discover restaurants, cafes, parks, and attractions in your area</p>
          </div>
          <div className="p-6 rounded-lg bg-white shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-3 text-[#0078D4]">Products</h2>
            <p className="text-gray-600">Find the best local and online products with detailed reviews</p>
          </div>
          <div className="p-6 rounded-lg bg-white shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-3 text-[#0078D4]">People</h2>
            <p className="text-gray-600">Connect with local experts, service providers, and professionals</p>
          </div>
          <div className="p-6 rounded-lg bg-white shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-3 text-[#0078D4]">Cities</h2>
            <p className="text-gray-600">Explore new cities with insider tips and local recommendations</p>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-600">
        <p className="text-lg">
          Need help finding something specific? Click the chat icon in the bottom right corner to get personalized recommendations!
        </p>
      </div>
    </main>
  );
}
