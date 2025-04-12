import { Sidebar } from '@/components/Sidebar'
import React from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className='flex h-screen w-full overflow-hidden'>

      <div className='w-64 shrink-0 border-r border-gray-200 dark:border-gray-800'>
        <Sidebar />
      </div>
      
      <div className='flex-1 overflow-hidden p-4 bg-gray-50 dark:bg-gray-900'>
        {children}
      </div>
    </main>
  )
}

export default Layout