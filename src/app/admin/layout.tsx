import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/db/mongodb';
import User from '@/models/User';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { LayoutDashboard, Users, Activity, Settings, UserCog, Stethoscope } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  await connectToDatabase();
  const dbUser = await User.findOne({ clerkId: userId });
  if (!dbUser || dbUser.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="p-6 flex items-center gap-2 text-white font-bold text-xl border-b border-slate-800">
          <Stethoscope className="w-6 h-6 text-blue-500" />
          SehatBridge AI
        </div>
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role</div>
          <div className="text-sm font-medium text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-400"></div> System Admin
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors bg-slate-800 text-white">
            <LayoutDashboard className="w-5 h-5" /> Overview
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <Users className="w-5 h-5" /> Staff & Clinics
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <Activity className="w-5 h-5" /> AI Audit Logs
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <Settings className="w-5 h-5" /> Configuration
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton />
            <span className="text-sm font-medium">My Account</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 md:hidden sticky top-0 z-10">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <UserCog className="w-5 h-5 text-slate-600" />
            Admin Portal
          </div>
          <UserButton />
        </header>
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
