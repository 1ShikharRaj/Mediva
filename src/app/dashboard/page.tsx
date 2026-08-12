import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/db/mongodb';
import User from '@/models/User';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Activity, UserCog } from 'lucide-react';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/');
  }

  // Connect to DB and ensure user exists
  await connectToDatabase();
  
  let dbUser = await User.findOne({ clerkId: userId });
  
  if (!dbUser) {
    dbUser = await User.create({
      clerkId: userId,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      // For hackathon purposes, let the user choose their role if not set
      role: 'PENDING'
    });
  }

  if (dbUser.role === 'HEALTH_WORKER') {
    redirect('/health-worker');
  } else if (dbUser.role === 'DOCTOR') {
    redirect('/doctor');
  } else if (dbUser.role === 'ADMIN') {
    redirect('/admin');
  }

  // If role is PENDING (Demo Mode Role Selector)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Welcome to SehatBridge AI Demo</h1>
          <p className="text-slate-600">Please select your role to continue testing the platform.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:border-blue-500 transition-colors cursor-pointer">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-blue-100 p-4 rounded-full mb-4">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle>Health Worker</CardTitle>
              <CardDescription>Operates the village clinic</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={async () => {
                "use server";
                await connectToDatabase();
                await User.findOneAndUpdate({ clerkId: userId }, { role: 'HEALTH_WORKER' });
                redirect('/health-worker');
              }}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit">Enter as Health Worker</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-500 transition-colors cursor-pointer">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-emerald-100 p-4 rounded-full mb-4">
                <Stethoscope className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle>Remote Doctor</CardTitle>
              <CardDescription>Reviews cases & provides care</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={async () => {
                "use server";
                await connectToDatabase();
                await User.findOneAndUpdate({ clerkId: userId }, { role: 'DOCTOR' });
                redirect('/doctor');
              }}>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" type="submit">Enter as Doctor</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="hover:border-slate-500 transition-colors cursor-pointer">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-slate-200 p-4 rounded-full mb-4">
                <UserCog className="w-8 h-8 text-slate-700" />
              </div>
              <CardTitle>Administrator</CardTitle>
              <CardDescription>System metrics & oversight</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={async () => {
                "use server";
                await connectToDatabase();
                await User.findOneAndUpdate({ clerkId: userId }, { role: 'ADMIN' });
                redirect('/admin');
              }}>
                <Button variant="outline" className="w-full" type="submit">Enter as Admin</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
