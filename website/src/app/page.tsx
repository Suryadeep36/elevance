import SplineScene from "@/components/Animation";
import AssetAnimation from "@/components/AssetAnimation";
import Brain from "@/components/Brain";
import MovingGlobe from "@/components/MovingGlobe"; 
import GrowGraph from "@/components/growGraph";
export default function Home() {
  return (
    <main className="relative w-full min-h-screen overflow-x-hidden bg-blue-950">
      {/* Hero Section with Background */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Background Spline Scene */}
        <div className="absolute inset-0 z-20">
          <SplineScene />
          {/* Refined blue gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/60 to-blue-900/80 pointer-events-none" />
        </div>
        {/* Foreground Hero Content */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-white text-center px-4 pointer-events-none">
          <div className="mt-32 sm:mt-40">
            <h1 className="text-6xl font-bold leading-tight text-blue-100">Elevance</h1>
            <p className="text-3xl font-bold leading-tight text-blue-200">
              A place to elevate and collaborate in tech.
            </p>
            <p className="mt-3 text-base sm:text-lg text-blue-300 max-w-xl mx-auto">
              Learn. Build. Grow. With the community.
            </p>
            <div className="mt-6 pointer-events-auto">
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition shadow-lg shadow-blue-700/30">
                Get started — it's free →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section Below */}
      <section className="relative z-40 bg-blue-950 text-white py-20 px-8 sm:px-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-blue-200">
          What makes Elevance special?
        </h2>

        {/* Feature 1 */}
        <div className="flex items-center justify-between gap-10 max-w-6xl mx-auto mb-16">
          {/* Text Content */}
          <div className="w-1/2 text-left">
            <h3 className="text-xl font-semibold mb-2 text-blue-200">🧠 Learn by Doing</h3>
            <p>Access hands-on projects and challenges designed to level up your tech skills.</p>
          </div>
          {/* 3D Object */}
          <div className="w-1/2">
          <Brain />  {/* This is where the 3D object will go */}
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex items-center justify-between gap-10 max-w-6xl mx-auto mb-16">
          {/* Text Content */}
          <div className="w-1/2">
          <MovingGlobe /> {/* This is where the 3D object will go */}
          </div>
          <div className="w-1/2 text-left">
            <h3 className="text-xl font-semibold mb-2 text-blue-200">🤝 Collaborate</h3>
            <p>Join a vibrant community of learners and mentors working together on cool stuff.</p>
          </div>
          {/* 3D Object */}
        </div>

        {/* Feature 3 */}
        <div className="flex items-center justify-between gap-10 max-w-6xl mx-auto">
          {/* Text Content */}
          <div className="w-1/2 text-left">
            <h3 className="text-xl font-semibold mb-2 text-blue-200">🚀 Grow Fast</h3>
            <p>Get feedback, improve your craft, and build a portfolio that stands out.</p>
          </div>
          {/* 3D Object */}
          <div className="w-1/2">
          <GrowGraph /> {/* This is where the 3D object will go */}
          </div>
        </div>
      </section>
    </main>
  );
}
