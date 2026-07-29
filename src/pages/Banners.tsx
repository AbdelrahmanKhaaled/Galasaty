import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/contexts/LanguageContext"
import { bannersAPI } from "@/lib/api"
import { DataTable } from "@/components/DataTable"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface Banner {
  id: number
  title?: {
    ar?: string
    en?: string
  }
  description?: {
    ar?: string
    en?: string
  }
  image?: string
  doctor_id?: number | null
  doctor?: any
  created_at?: string
  updated_at?: string
}

export function Banners() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const response = await bannersAPI.getAll()
      setBanners(response.data?.data || [])
    } catch (error) {
      console.error("Error fetching banners:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [language])

  // Filter banners to only show those with content in the selected language
  const filteredBanners = useMemo(() => {
    return banners.filter((banner) => {
      if (language === 'ar') {
        // For Arabic, show banners that have Arabic title or description
        return !!(banner.title?.ar || banner.description?.ar)
      } else {
        // For English, show banners that have English title or description
        return !!(banner.title?.en || banner.description?.en)
      }
    })
  }, [banners, language])

  const handleAdd = () => {
    setEditingBanner(null)
    setSelectedImage(null)
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setSelectedImage(null)
    // Set initial preview to the existing banner image
    if (banner.image) {
      const imageUrl = banner.image.startsWith('http') 
        ? banner.image 
        : `https://galasaty.teamqeematech.site/storage/${banner.image}`
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
      // Create preview URL for the new image
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleView = (banner: Banner) => {
    navigate(`/dashboard/banners/${banner.id}`)
  }

  const handleDelete = async (banner: Banner) => {
    if (window.confirm(t("banners.deleteBanner"))) {
      try {
        await bannersAPI.delete(banner.id)
        fetchBanners()
      } catch (error) {
        console.error("Error deleting banner:", error)
        alert(t("banners.deleteError"))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // If a new image was selected, add it to formData
    if (selectedImage) {
      formData.set("image", selectedImage)
    }
    
    try {
      if (editingBanner) {
        await bannersAPI.update(editingBanner.id, formData)
      } else {
        await bannersAPI.create(formData)
      }
      setIsModalOpen(false)
      setEditingBanner(null)
      setSelectedImage(null)
      setImagePreview(null)
      fetchBanners()
    } catch (error) {
      console.error("Error saving banner:", error)
      alert(t("banners.saveError"))
    }
  }

  const columns = [
    { key: "id", label: t("common.id") },
    {
      key: "title",
      label: t("banners.title"),
      render: (banner: Banner) => {
        // Show only the title in the selected language
        const title = language === 'ar' 
          ? (banner.title?.ar || "N/A")
          : (banner.title?.en || "N/A")
        const altTitle = language === 'ar' 
          ? (banner.title?.ar || "Banner")
          : (banner.title?.en || "Banner")
        
        return (
          <div className="flex items-center gap-3">
            {banner.image && (
              <img 
                src={banner.image.startsWith('http') ? banner.image : `https://galasaty.teamqeematech.site/storage/${banner.image}`} 
                alt={altTitle} 
                className="h-10 w-10 rounded object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40'
                }}
              />
            )}
            <div>
              <div className="font-medium">{title}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: "description",
      label: t("common.description"),
      render: (banner: Banner) => {
        // Show only the description in the selected language
        const description = language === 'ar'
          ? (banner.description?.ar || "N/A")
          : (banner.description?.en || "N/A")
        return (
          <div className="max-w-md truncate">
            {description}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("banners.title")}</h1>
      </div>

      <DataTable
        data={filteredBanners}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onAdd={handleAdd}
        addLabel={t("banners.addBanner")}
        isLoading={loading}
        getItemId={(item) => item.id}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? t("banners.editBanner") : t("banners.addBanner")}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title_ar">{t("banners.titleAr")}</Label>
            <Input
              id="title_ar"
              name="title_ar"
              defaultValue={editingBanner?.title?.ar || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title_en">{t("banners.titleEn")}</Label>
            <Input
              id="title_en"
              name="title_en"
              defaultValue={editingBanner?.title?.en || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_ar">{t("banners.descriptionAr")}</Label>
            <Input
              id="description_ar"
              name="description_ar"
              defaultValue={editingBanner?.description?.ar || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_en">{t("banners.descriptionEn")}</Label>
            <Input
              id="description_en"
              name="description_en"
              defaultValue={editingBanner?.description?.en || ""}
            />
          </div>
          {/* Professional Image Upload Section */}
          <div className="flex flex-col items-center space-y-4 border-t pt-4">
            <div className="relative">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-lg ring-2 ring-primary/20">
                {(imagePreview || editingBanner?.image) ? (
                  <img
                    src={imagePreview || (editingBanner?.image?.startsWith('http') ? editingBanner.image : `https://galasaty.teamqeematech.site/storage/${editingBanner?.image}`)}
                    alt={editingBanner?.title?.ar || editingBanner?.title?.en || "Banner"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=B'
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 text-4xl font-semibold text-primary">
                    B
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
                    {(imagePreview || editingBanner?.image) ? t("profile.changeImage") : t("profile.uploadImage")}
                  </span>
                </div>
              </Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!editingBanner}
                className="hidden"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctor_id">Doctor ID (optional)</Label>
            <Input
              id="doctor_id"
              name="doctor_id"
              type="number"
              defaultValue={editingBanner?.doctor_id?.toString() || ""}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">{editingBanner ? t("common.save") : t("common.add")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

