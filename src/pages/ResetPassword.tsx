import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { authAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    otp: "",
    remember_token: searchParams.get("token") || "",
    password: "",
    re_password: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (formData.password !== formData.re_password) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      console.log("Sending reset password request with data:", {
        otp: formData.otp,
        remember_token: formData.remember_token ? "***present***" : "MISSING",
        password: "***hidden***",
        re_password: "***hidden***",
      });
      
      await authAPI.resetPassword(formData)
      setSuccess("Password reset successful! Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err: any) {
      console.error("Reset password error:", err)
      console.error("Error response:", err.response?.data)
      
      // Better error message extraction
      let errorMessage = "Failed to reset password. Please try again.";
      if (err.response?.data) {
        errorMessage = err.response.data.message || 
                      err.response.data.error || 
                      (typeof err.response.data === 'string' ? err.response.data : errorMessage);
      } else if (err.message) {
        errorMessage = err.message;
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
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter the code from your email and your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
                {success}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter code from email"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remember_token">Remember Token</Label>
              <Input
                id="remember_token"
                // type="text"
                type="hidden"
                placeholder="Token from email"
                value={formData.remember_token}
                onChange={(e) => setFormData({ ...formData, remember_token: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="re_password">Confirm New Password</Label>
              <Input
                id="re_password"
                type="password"
                value={formData.re_password}
                onChange={(e) => setFormData({ ...formData, re_password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
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

