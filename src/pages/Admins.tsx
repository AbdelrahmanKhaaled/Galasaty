import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { adminsAPI } from "@/lib/api"
import { DataTable } from "@/components/DataTable"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface Admin {
  id: number
  name?: string
  email?: string
  phone?: string
  status?: string
  image?: string
  permissions?: string[]
}

export function Admins() {
  const { t } = useTranslation()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await adminsAPI.getAll({
        search,
        status: statusFilter,
      })
      setAdmins(response.data?.data || [])
    } catch (error) {
      console.error("Error fetching admins:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await adminsAPI.getPermissions()
      setPermissions(response.data?.permissions || [])

    } catch (error) {
      console.error("Error fetching permissions:", error)
      setPermissions([]); // fallback
    }
  }

  useEffect(() => {
    fetchAdmins()
    fetchPermissions()
  }, [search, statusFilter])

  const handleAdd = () => {
    setEditingAdmin(null)
    setSelectedImage(null)
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setSelectedImage(null)
    // Set image preview
    if (admin.image) {
      const imageUrl = admin.image.startsWith('http') 
        ? admin.image 
        : `https://galasaty.teamqeematech.site/storage/${admin.image}`
      setImagePreview(imageUrl)
    } else {
      setImagePreview(null)
    }
    setIsModalOpen(true)
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedImage(null)
      setImagePreview(editingAdmin?.image ? (editingAdmin.image.startsWith('http') ? editingAdmin.image : `https://galasaty.teamqeematech.site/storage/${editingAdmin.image}`) : null)
    }
  }

  const handleDelete = async (admin: Admin) => {
    if (window.confirm(`${t("admins.deleteAdmin")} ${admin.name || admin.email}?`)) {
      try {
        await adminsAPI.delete(admin.id)
        fetchAdmins()
      } catch (error) {
        console.error("Error deleting admin:", error)
        alert(t("admins.deleteError"))
      }
    }
  }

  const handleToggle = async (admin: Admin) => {
    try {
      await adminsAPI.toggle(admin.id)
      fetchAdmins()
    } catch (error) {
      console.error("Error toggling admin:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  
    // Build FormData from form
    const formData = new FormData(e.currentTarget)
  
    // Add selected image if a new one was selected
    if (selectedImage) {
      formData.set("image", selectedImage)
    }
  
    // ✅ DEBUG: Verify payload before submitting
    console.group("FormData")
    for (const [key, value] of formData.entries()) {
      console.log(key, value)
    }
    console.groupEnd()
  
    try {
      if (editingAdmin) {
        await adminsAPI.update(editingAdmin.id, formData)
      } else {
        await adminsAPI.create(formData)
      }
  
      setIsModalOpen(false)
      setSelectedImage(null)
      setImagePreview(null)
      fetchAdmins()
  
    } catch (error: any) {
  
      // ✅ Catch FULL axios error
      console.error("Error saving admin:", error)
  
      if (error.response) {
        // ✅ Server responded with error status (422, 500, etc.)
        console.log("Status Code:", error.response.status)
        console.log("Backend Error:", error.response.data)
  
        // ✅ Try all common backend message patterns
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          error.response.data?.errors?.email?.[0] ||
          "Server error occurred"
  
        alert(message)
  
      } else if (error.request) {
        // ✅ Request sent but server did NOT respond
        console.error("No response received:", error.request)
        alert("Network error: Server not responding")
  
      } else {
        // ✅ Something else failed before request was sent
        alert("Unexpected error: " + error.message)
      }
    }
  }
  

  const columns = [
    { key: "id", label: t("common.id") },
    {
      key: "name",
      label: t("admins.name"),
      render: (admin: Admin) => (
        <div className="flex items-center gap-3">
          {admin.image && (
            <img src={admin.image} alt={admin.name} className="h-10 w-10 rounded-full object-cover" />
          )}
          <span>{admin.name || "N/A"}</span>
        </div>
      ),
    },
    { key: "email", label: t("admins.email") },
    { key: "phone", label: t("patients.phone") },
    {
      key: "status",
      label: t("patients.status"),
      render: (admin: Admin) => (
        <span className={`rounded-full px-2 py-1 text-xs ${
          admin.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          {admin.status === "active" ? t("common.active") : admin.status === "inactive" ? t("common.inactive") : admin.status || "N/A"}
        </span>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">{t("admins.title")}</h1>
        <div className="flex gap-2">
          <Input
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("patients.status")}</option>
            <option value="active">{t("common.active")}</option>
            <option value="inactive">{t("common.inactive")}</option>
          </select>
        </div>
      </div>

      <DataTable
        data={admins}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        onAdd={handleAdd}
        addLabel={t("admins.addAdmin")}
        isLoading={loading}
        getItemId={(item) => item.id}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedImage(null)
          setImagePreview(null)
        }}
        title={editingAdmin ? t("admins.editAdmin") : t("admins.addAdmin")}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("admins.name")}</Label>
            <Input id="name" name="name" defaultValue={editingAdmin?.name || ""} required />
          </div>
          {!editingAdmin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">{t("admins.email")}</Label>
                <Input id="email" name="email" type="email" defaultValue="" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("login.password")}</Label>
                <Input id="password" name="password" type="password" required={!editingAdmin} />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="phone">{t("patients.phone")}</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={editingAdmin?.phone || ""} />
          </div>
          {/* Professional Image Upload Section */}
          <div className="flex flex-col items-center space-y-4 border-t pt-4">
            <div className="relative">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-lg ring-2 ring-primary/20">
                {(imagePreview || editingAdmin?.image) ? (
                  <img
                    src={imagePreview || (editingAdmin?.image?.startsWith('http') ? editingAdmin.image : `https://galasaty.teamqeematech.site/storage/${editingAdmin?.image}`)}
                    alt={editingAdmin?.name || t("admins.name")}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=' + (editingAdmin?.name?.charAt(0) || 'A')
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 text-4xl font-semibold text-primary">
                    {editingAdmin?.name?.charAt(0)?.toUpperCase() || 'A'}
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
                    {(imagePreview || editingAdmin?.image) ? t("profile.changeImage") : t("profile.uploadImage")}
                  </span>
                </div>
              </Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("admins.role")}</Label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-2">
              {permissions.map((perm) => (
                <label key={perm} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="permissions[]"
                    value={perm}
                    defaultChecked={editingAdmin?.permissions?.includes(perm)}
                    className="rounded"
                  />
                  <span className="text-sm">{perm}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.save")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}





