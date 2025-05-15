"use client"
import SplineScene from "@/components/Animation";
import Brain from "@/components/Brain";
import MovingGlobe from "@/components/MovingGlobe";
import GrowGraph from "@/components/growGraph";
import { useState, useEffect } from "react";
import { TechLoader } from "@/components/TechLoader";
import { useAuth } from '@clerk/nextjs';
import Link from "next/link";
import { useUser } from '@clerk/nextjs';
import axios from "axios";

export default function Home() {

  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const createUserIfNotExists = async () => {
      console.log(isSignedIn , " " , user ,  " " , isLoaded)
      if (!user || !isLoaded) return;

      if(isSignedIn){
        const api = await axios.get(`/api/user/${user.id}`);
        const data = api.data;
        if(data.user){
          return;
        }
      }

      try {
        console.log("in try")
        const res = await fetch('/api/sign-up', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerk_Id: user.id,
            name: user.fullName,
            email: user.emailAddresses[0]?.emailAddress,
            profileImage: user.imageUrl,
            role: 'USER',
          }),
        });

        if (res.ok) {
          console.log('User saved in DB');
        } else {
          const err = await res.json();
          console.error('User creation failed:', err.msg || err.error);
        }
      } catch (err) {
        console.error('Error in user creation:', err);
      }
    };

    createUserIfNotExists();
  }, [isSignedIn, user]);


  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // Adjust the duration as needed

    return () => clearTimeout(timer);
  }

    , []);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-blue-950">
        <TechLoader />
      </div>
    );
  }

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden bg-blue-950">
      <div className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0 z-20">
          <SplineScene />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/60 to-blue-900/80 pointer-events-none" />
        </div>
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-white text-center px-4 pointer-events-none">
          <div className="mt-32 sm:mt-40">
            <h1 className="text-6xl font-bold leading-tight text-blue-100 font-rajdhani">Elevance</h1>
            <p className="text-3xl font-bold leading-tight text-blue-200">
              A place to elevate and collaborate in tech.
            </p>
            <p className="mt-3 text-base sm:text-lg text-blue-300 max-w-xl mx-auto">
              Learn. Build. Grow. With the community.
            </p>
            <div className="mt-6 pointer-events-auto">
              <Link href={isSignedIn ? "/dashboard" : "/sign-in"} className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-blue-900 bg-blue-200 rounded-lg shadow-lg hover:bg-blue-300 transition duration-300">
                {isSignedIn ? "Go to Dashboard" : "Get Started"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="relative z-40 bg-blue-950 text-white py-20 px-8 sm:px-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-blue-200">
          What makes Elevance special?
        </h2>

        <div className="flex items-center justify-between gap-10 max-w-6xl mx-auto mb-16">
          <div className="w-1/2 text-left">
            <h3 className="text-xl font-semibold mb-2 text-blue-200">🧠 Learn by Doing</h3>
            <p>Kickstart your journey with personalized career assessments and curated content tailored to your interests and strengths. The system guides you through interactive modules to build real-world skills while tracking your growth.</p>
          </div>
          <div className="w-1/2">
            <Brain />
          </div>
        </div>

        <div className="flex items-center justify-between gap-10 max-w-6xl mx-auto mb-16">
          <div className="w-1/2">
            <MovingGlobe />
          </div>
          <div className="w-1/2 text-left">
            <h3 className="text-xl font-semibold mb-2 text-blue-200">🤝 Collaborate</h3>
            <p>Connect with like-minded learners, mentors, and advisors in your preferred tech domain. From personalized roadmaps to real-time feedback, grow together with a supportive community and expert suggestions.</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-10 max-w-6xl mx-auto">
          <div className="w-1/2 text-left">
            <h3 className="text-xl font-semibold mb-2 text-blue-200">🚀 Grow Fast</h3>
            <p>Our smart advisor uses AI-driven analysis to recommend the best learning paths based on your evolving profile—so you keep moving forward with purpose and precision.</p>
          </div>
          <div className="w-1/2">
            <GrowGraph />
          </div>
        </div>
      </section>
    </main>
  );
}
