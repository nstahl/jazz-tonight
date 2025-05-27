import { ReactNode } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="mt-4">
          <Link 
            href="/admin" 
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/events" 
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Events
          </Link>
          <Link 
            href="/admin/artists" 
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Artists
          </Link>
          <Link 
            href="/admin/venues" 
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Venues
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 