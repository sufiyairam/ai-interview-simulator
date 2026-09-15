export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
      
      <div className="text-xl font-bold text-blue-600">
        AI Interview Simulator
      </div>

      <div className="flex items-center gap-6">
        <a href="#features" className="text-gray-600 hover:text-blue-600">
          Features
        </a>

        <a href="#how-it-works" className="text-gray-600 hover:text-blue-600">
          How It Works
        </a>

        <button className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700">
          Start Interview
        </button>
      </div>

    </nav>
  );
}