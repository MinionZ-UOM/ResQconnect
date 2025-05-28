import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Shield, Users, UserCircle, Building } from "lucide-react"
import { DisasterList } from "@/components/disasters/disaster-list"

export default function Home() {
  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800"
    >

      {/* Main content */}
      <div className="relative z-10">
        <header className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-blue-700 dark:text-blue-400 mb-4">ResQConnect</h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl">
              AI-powered disaster response coordination platform for efficient resource allocation and communication
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-slate-800 dark:text-slate-200">
            Choose Your Role
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <RoleCard
              title="First Responders"
              description="Receive prioritized tasks and coordinate resource deployment."
              icon={<Shield className="h-12 w-12 text-red-500" />}
            />
            <RoleCard
              title="Volunteers"
              description="Assist with relief tasks, field updates, and local support during emergencies."
              icon={<Users className="h-12 w-12 text-green-500" />}
            />
            <RoleCard
              title="Affected Individuals"
              description="Request help, share your situation, and get live updates from responders."
              icon={<UserCircle className="h-12 w-12 text-blue-500" />}
            />
            <RoleCard
              title="Government Help Centre"
              description="Administer the platform and oversee coordination."
              icon={<Building className="h-12 w-12 text-purple-500" />}
            />
          </div>

          {/* REGISTER NOW button */}
          <div className="flex justify-center">
            <Link href="/auth/login?role=responder">
              <Button
                className="text-2xl px-20 py-10 rounded-xl bg-blue-600/70 text-white font-bold backdrop-blur-md border border-white/30 shadow-xl hover:bg-blue-600/90 transition-all duration-300"
              >
                GET STARTED
              </Button>
            </Link>
          </div>
        </section>

        {/*
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-slate-800 dark:text-slate-200">
              Active Disasters
            </h2>
            <DisasterList />
          </section>

          <section className="mb-16">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-200">
                How ResQConnect Works
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                  number="1"
                  title="Submit Requests"
                  description="Report incidents or request help using text, images, or voice"
                />

                <FeatureCard
                  number="2"
                  title="AI Processing"
                  description="Our AI analyzes, categorizes, and prioritizes requests based on urgency"
                />

                <FeatureCard
                  number="3"
                  title="Coordinated Response"
                  description="Resources are allocated efficiently and tasks assigned to responders"
                />
              </div>
            </div>
          </section>
        */}
        </main>
      </div>
    </div>
    
  );
}


function RoleCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader className="flex flex-col items-center text-center">
        {icon}
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}


function FeatureCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  )
}
