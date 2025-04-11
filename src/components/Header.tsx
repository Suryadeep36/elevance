'use client';

import React from 'react'
import { UserButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';

function Header() {

  const { isSignedIn, isLoaded } = useAuth();


  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <h1 className="text-2xl font-bold">Elevance</h1>
      <nav className="flex items-center space-x-4">
        <a href="/" className="hover:text-gray-300">Home</a>
        {isLoaded && (
                                isSignedIn ? (
                                    <div className="flex items-center justify-between px-4">
                                        <UserButton afterSignOutUrl="/" />
                                    </div>
                                ) : (
                                    <div className="px-4">
                                        <Link 
                                            href="/sign-in" 
                                            className="btn-primary w-full text-center text-sm py-2.5"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Sign in
                                        </Link>
                                    </div>
                                )
                            )}
      </nav>
    </header>
  )
}

export default Header