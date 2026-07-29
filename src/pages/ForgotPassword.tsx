import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { authAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [rememberToken, setRememberToken] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      console.log("Sending forgot password request for email:", email)
      const response = await authAPI.forgotPassword(email)
      console.log("Forgot password response:", response)
      console.log("Response data:", response.data)
      console.log("Full response:", JSON.stringify(response.data, null, 2))
      
      // Check if response contains remember_token
      const token = response.data?.remember_token || response.data?.data?.remember_token
      if (token) {
        setRememberToken(token)
        console.log("Remember token received:", token)
      }
      
      // Check if response contains OTP code (some backends return it directly for testing)
      const otpCode = response.data?.otp || response.data?.code || response.data?.data?.otp || response.data?.data?.code
      
      // Check for success message in response
      const message = response.data?.message || response.data?.data?.message || response.data?.data
      
      if (otpCode) {
        // If OTP is in response, show it to user (for testing/development)
        setSuccess(
          `Password reset code: ${otpCode}\n\n` +
          (message || "Please use this code along with the remember token to reset your password.")
        )
        if (token) {
          setRememberToken(token)
        }
      } else if (message) {
        setSuccess(message)
      } else {
        setSuccess("Password reset code has been sent to your email. Please check your inbox (and spam folder) and use the code to reset your password.")
      }
    } catch (err: any) {
      console.error("Forgot password error:", err)
      console.error("Error response:", err.response)
      console.error("Error response data:", err.response?.data)
      
      // Better error handling
      let errorMessage = "Failed to send reset code. Please try again."
      
      if (err.response) {
        // Server responded with error
        const errorData = err.response.data
        console.error("Error response data:", errorData)
        
        if (errorData?.message) {
          errorMessage = errorData.message
        } else if (errorData?.error) {
          errorMessage = errorData.error
        } else if (typeof errorData === "string") {
          errorMessage = errorData
        } else if (errorData?.errors) {
          // Laravel validation errors
          const errors = Object.values(errorData.errors).flat()
          errorMessage = errors.join(", ") || `Server error: ${err.response.status}`
        } else {
          errorMessage = `Server error: ${err.response.status} ${err.response.statusText}. Please check the browser console for more details.`
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "Network error: No response from server. Please check your internet connection."
      } else {
        // Error setting up the request
        errorMessage = err.message || "An unexpected error occurred."
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset code</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 space-y-2">
                <p className="whitespace-pre-line">{success}</p>
                {!success.includes("Password reset code:") && (
                  <p className="text-xs text-green-700">
                    💡 <strong>Tip:</strong> Check your spam/junk folder if you don't see the email in your inbox.
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>
            {rememberToken && (
              <div className="rounded-md bg-blue-500/10 p-3 text-sm text-blue-600">
                <p className="mb-2">Code sent! Click below to reset your password:</p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/reset-password?token=${rememberToken}`)}
                >
                  Go to Reset Password
                </Button>
              </div>
            )}
            <div className="text-center text-sm">
              <Link to="/login" className="text-muted-foreground hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

