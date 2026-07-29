import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/contexts/LanguageContext"
import { bannersAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

export function SingleBanner() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [banner, setBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const fetchBanner = async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await bannersAPI.getOne(Number(id))
      setBanner(response.data?.data || response.data)
    } catch (error) {
      console.error("Error fetching banner:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanner()
  }, [id, language])

  const handleDelete = async () => {
    if (!banner) return
    try {
      await bannersAPI.delete(banner.id)
      navigate("/dashboard/banners")
    } catch (error) {
      console.error("Error deleting banner:", error)
      alert(t("banners.deleteError"))
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!banner) return
    const formData = new FormData(e.currentTarget)
    try {
      await bannersAPI.update(banner.id, formData)
      setIsEditModalOpen(false)
      fetchBanner()
    } catch (error) {
      console.error("Error updating banner:", error)
      alert(t("banners.saveError"))
    }
  }

  if (loading) {
    return <div className="text-center py-8">{t("common.loading")}</div>
  }

  if (!banner) {
    return (
      <div className="text-center py-8">
        <p>{t("banners.notFound")}</p>
        <Link to="/dashboard/banners">
          <Button variant="outline" className="mt-4">
            {t("banners.backToBanners")}
          </Button>
        </Link>
      </div>
    )
  }

  const getTitle = (title: { ar?: string; en?: string } | undefined) => {
    if (!title) return "N/A"
    return (language === 'ar' ? title.ar : title.en) || title.en || title.ar || "N/A"
  }

  const getDescription = (desc: { ar?: string; en?: string } | undefined) => {
    if (!desc) return "N/A"
    return (language === 'ar' ? desc.ar : desc.en) || desc.en || desc.ar || "N/A"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/banners">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{t("banners.details")}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            {t("common.edit")}
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
            <Trash2 className="mr-2 h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("banners.basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">{t("common.id")}</Label>
              <p className="text-lg font-semibold">{banner.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("banners.titleEnLabel")}</Label>
              <p className="text-lg">{getTitle(banner.title)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("banners.titleArLabel")}</Label>
              <p className="text-lg">{banner.title?.ar || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("banners.descriptionEnLabel")}</Label>
              <p className="text-muted-foreground">{getDescription(banner.description)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("banners.descriptionArLabel")}</Label>
              <p className="text-muted-foreground">{banner.description?.ar || "N/A"}</p>
            </div>
            {banner.doctor_id && (
              <div>
                <Label className="text-muted-foreground">{t("banners.doctorId")}</Label>
                <p className="text-lg">{banner.doctor_id}</p>
              </div>
            )}
            {banner.created_at && (
              <div>
                <Label className="text-muted-foreground">{t("banners.createdAt")}</Label>
                <p className="text-muted-foreground">{new Date(banner.created_at).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("common.image")}</CardTitle>
          </CardHeader>
          <CardContent>
            {banner.image ? (
              <img
                src={banner.image.startsWith('http') ? banner.image : `https://galasaty.teamqeematech.site/storage/${banner.image}`}
                alt={getTitle(banner.title)}
                className="h-48 w-full rounded-lg object-cover"
              />
            ) : (
              <p className="text-muted-foreground">{t("banners.noImage")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("banners.editBanner")}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title_ar">{t("banners.titleAr")}</Label>
              <Input
                id="title_ar"
                name="title_ar"
                defaultValue={banner.title?.ar || ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_en">{t("banners.titleEn")}</Label>
              <Input
                id="title_en"
                name="title_en"
                defaultValue={banner.title?.en || ""}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description_ar">{t("banners.descriptionAr")}</Label>
              <Input
                id="description_ar"
                name="description_ar"
                defaultValue={banner.description?.ar || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_en">{t("banners.descriptionEn")}</Label>
              <Input
                id="description_en"
                name="description_en"
                defaultValue={banner.description?.en || ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">{t("common.image")}</Label>
            <Input id="image" name="image" type="file" accept="image/*" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctor_id">{t("banners.doctorId")} (optional)</Label>
            <Input
              id="doctor_id"
              name="doctor_id"
              type="number"
              defaultValue={banner.doctor_id?.toString() || ""}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("banners.update")}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t("common.delete")}
      >
        <div className="space-y-4">
          <p>{t("banners.deleteConfirm")}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

