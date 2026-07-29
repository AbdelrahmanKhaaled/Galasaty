import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/contexts/AuthContext"
import { authAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"

export function Profile() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    re_password: "",
  })
  const [image, setImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        password: "",
        re_password: "",
      })
      if (user.image) {
        const imageUrl = (user.image as string).startsWith('http') 
          ? (user.image as string)
          : `https://galasaty.teamqeematech.site/storage/${user.image}`;
        setPreviewImage(imageUrl)
      }
    }
  }, [user])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (formData.password && formData.password !== formData.re_password) {
      setError(t("profile.passwordsDoNotMatch"))
      return
    }

    setLoading(true)

    try {
      const data = new FormData()
      
      if (formData.name) {
        data.append("name", formData.name)
      }
      
      if (formData.password) {
        data.append("password", formData.password)
        data.append("re_password", formData.re_password)
      }
      
      if (image) {
        data.append("image", image)
      }

      await authAPI.update(data)
      setSuccess(t("profile.updateSuccess"))
      
      await authAPI.getProfile()

      // Reset password fields
      setFormData({ ...formData, password: "", re_password: "" })
    } catch (err: any) {
      console.error("Update profile error:", err)
      setError(err.response?.data?.message || err.message || t("profile.updateError"))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setError("")

    try {
      await authAPI.deleteAccount()
      await logout()
      navigate("/login")
    } catch (err: any) {
      console.error("Delete account error:", err)
      setError(err.response?.data?.message || err.message || t("profile.deleteError"))
      setDeleting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.updateProfile")}</CardTitle>
          <CardDescription>{t("profile.updateProfileDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-6">
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

            {/* Professional Profile Image Section */}
            <div className="flex flex-col items-center space-y-4 border-b pb-6">
              <div className="relative">
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-lg ring-2 ring-primary/20">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={user?.name || t("profile.preview")}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=' + (user?.name?.charAt(0) || 'A')
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 text-4xl font-semibold text-primary">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-primary shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-primary-foreground"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{user?.name || t("profile.name")}</h3>
                {/* <p className="text-sm text-muted-foreground">{user?.email }</p> */}
              </div>
              <div className="w-full max-w-xs">
                <Label htmlFor="image" className="cursor-pointer">
                  <div className="flex items-center justify-center rounded-md border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-3 transition-colors hover:border-primary/50 hover:bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-primary"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm9 4a1 1 0 10-2 0 1 1 0 002 0zm-2-3a1 1 0 11-2 0 1 1 0 012 0zM9 10a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                      <path d="M15 8h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2v-6a2 2 0 00-2-2H9v-2h2a1 1 0 011 1v1z" />
                    </svg>
                    <span className="text-sm font-medium text-primary">
                      {previewImage ? t("profile.changeImage") : t("profile.uploadImage")}
                    </span>
                  </div>
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("profile.email")}</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">{t("profile.emailCannotBeChanged")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t("profile.name")}</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">{t("profile.changePassword")}</h3>
              <div className="space-y-2">
                <Label htmlFor="password">{t("profile.newPassword")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t("profile.passwordPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="re_password">{t("profile.confirmNewPassword")}</Label>
                <Input
                  id="re_password"
                  type="password"
                  value={formData.re_password}
                  onChange={(e) => setFormData({ ...formData, re_password: e.target.value })}
                  placeholder={t("profile.passwordPlaceholder")}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? t("profile.updating") : t("profile.updateProfile")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>{t("profile.pushNotificationTokens")}</CardTitle>
          <CardDescription>{t("profile.pushNotificationTokensDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateTokens} className="space-y-4">
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
              <Label htmlFor="player_id">{t("profile.oneSignalPlayerId")}</Label>
              <Input
                id="player_id"
                type="text"
                placeholder={t("profile.oneSignalPlayerIdPlaceholder")}
                value={tokens.player_id}
                onChange={(e) => setTokens({ ...tokens, player_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fcm_token">{t("profile.fcmToken")}</Label>
              <Input
                id="fcm_token"
                type="text"
                placeholder={t("profile.fcmTokenPlaceholder")}
                value={tokens.fcm_token}
                onChange={(e) => setTokens({ ...tokens, fcm_token: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={updatingTokens || (!tokens.player_id && !tokens.fcm_token)}>
              {updatingTokens ? t("profile.updatingTokens") : t("profile.updateTokens")}
            </Button>
          </form>
        </CardContent>
      </Card> */}

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t("profile.dangerZone")}</CardTitle>
          <CardDescription>{t("profile.dangerZoneDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            {t("profile.deleteConfirmDescription")}
          </p>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {t("profile.deleteAccount")}
          </Button>
        </CardContent>
      </Card>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t("profile.deleteAccount")}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("profile.deleteConfirm")}
          </p>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? t("profile.deleting") : t("profile.deleteAccount")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

