"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // In a real app, this would be an API call to send a password reset email
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock successful submission
      console.log("Password reset requested for:", email)
      setIsSubmitted(true)
    } catch (error) {
      console.error("Password reset error:", error)
      setError("Error sending reset link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 px-4 py-8 dark:from-slate-900 dark:to-slate-800 sm:px-6 md:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-700 dark:text-blue-400">
              <AlertTriangle className="h-6 w-6" />
              <span>ResQConnect</span>
            </div>
          </Link>
        </div>

        <Card className="border-none shadow-lg">
          {!isSubmitted ? (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                <CardDescription className="text-center">
                  Enter your email address and we'll send you a link to reset your password
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm border border-red-200">{error}</div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full h-11" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>

                  <div className="text-center">
                    <Link
                      href="/auth/login"
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to login
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </>
          ) : (
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We've sent a password reset link to <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-slate-500 mb-6">If you don't see it, please check your spam folder</p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Return to Login</Link>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
