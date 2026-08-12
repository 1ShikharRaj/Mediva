import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Stethoscope, Video, Activity, Users } from 'lucide-react';
import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <header className="px-6 py-4 flex items-center justify-between bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900">SehatBridge<span className="text-blue-600">AI</span></span>
        </div>
        <nav className="flex items-center gap-4">
          {!userId ? (
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          ) : (
            <>
              <UserButton />
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 flex flex-col items-center text-center px-6 bg-gradient-to-b from-blue-50 to-slate-50">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            AI Clinical Copilot for Rural Health Workers
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 text-slate-900">
            Transforming rural clinics with <span className="text-blue-600">AI-assisted care</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
            Empowering health workers to structure clinical cases, identify safety signals, and connect patients with remote doctors for faster, safer, and better outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                Launch Clinic Demo <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg bg-white w-full sm:w-auto">
                See How It Works
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How SehatBridge Works</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Our platform bridges the gap between rural clinics and expert care through structured AI intake and safety-first workflows.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Activity className="w-10 h-10 text-blue-500" />}
              title="AI-Assisted Intake"
              description="Health workers use voice or text to collect patient symptoms, vitals, and medical history. AI structures the unstructured data."
            />
            <FeatureCard 
              icon={<Shield className="w-10 h-10 text-amber-500" />}
              title="Safety-First Triage"
              description="A deterministic safety engine evaluates the extracted data against configured clinical protocols to flag urgent cases immediately."
            />
            <FeatureCard 
              icon={<Video className="w-10 h-10 text-emerald-500" />}
              title="Remote Consultation"
              description="Doctors review the AI-generated structured case brief and connect via video for the final clinical decision and care plan."
            />
          </div>
        </section>

        {/* Workflow Section */}
        <section className="w-full py-20 bg-slate-900 text-white px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-10">The Central Principle</h2>
            <blockquote className="text-2xl italic text-slate-300 border-l-4 border-blue-500 pl-6 text-left my-8">
              "AI assists. Protocols constrain. Doctors decide."
            </blockquote>
            <p className="text-lg text-slate-400 mb-8 text-left">
              SehatBridge AI does not replace rural doctors. It makes rural healthcare workers more capable and remote doctors more effective by turning patient information into a structured, safety-first clinical handoff.
            </p>
          </div>
        </section>
      </main>

      <footer className="w-full py-8 text-center text-slate-500 border-t bg-white">
        <p>© 2026 SehatBridge AI. Built for the Healthcare Hackathon.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="mb-6 p-4 bg-slate-50 rounded-full">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
