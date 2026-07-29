import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/contexts/LanguageContext"
import { servicesAPI, categoriesAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Service {
  id: number
  name?: string | { ar?: string; en?: string }
  name_ar?: string
  name_en?: string
  description?: string | { ar?: string; en?: string }
  description_ar?: string
  description_en?: string
  image?: string
  category_id?: number
  category?: { name?: string | { ar?: string; en?: string }; name_ar?: string; name_en?: string }
}

export function SingleService() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [service, setService] = useState<Service | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const fetchService = async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await servicesAPI.getOne(Number(id))
      setService(response.data?.data || response.data)
    } catch (error) {
      console.error("Error fetching service:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      setCategories(response.data?.data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  useEffect(() => {
    fetchService()
    fetchCategories()
  }, [id, language])

  const handleDelete = async () => {
    if (!service) return
    try {
      await servicesAPI.delete(service.id)
      navigate("/dashboard/services")
    } catch (error) {
      console.error("Error deleting service:", error)
      alert(t("services.deleteError"))
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!service) return
    const formData = new FormData(e.currentTarget)
    try {
      await servicesAPI.update(service.id, formData)
      setIsEditModalOpen(false)
      fetchService()
    } catch (error) {
      console.error("Error updating service:", error)
      alert(t("services.saveError"))
    }
  }

  if (loading) {
    return <div className="text-center py-8">{t("common.loading")}</div>
  }

  if (!service) {
    return (
      <div className="text-center py-8">
        <p>{t("services.notFound")}</p>
        <Link to="/dashboard/services">
          <Button variant="outline" className="mt-4">
            {t("services.backToServices")}
          </Button>
        </Link>
      </div>
    )
  }

  const getName = (name: string | { ar?: string; en?: string } | undefined) => {
    if (!name) return "N/A"
    if (typeof name === 'string') return name
    return (language === 'ar' ? name.ar : name.en) || name.en || name.ar || "N/A"
  }

  const getDescription = (desc: string | { ar?: string; en?: string } | undefined) => {
    if (!desc) return "N/A"
    if (typeof desc === 'string') return desc
    return (language === 'ar' ? desc.ar : desc.en) || desc.en || desc.ar || "N/A"
  }

  const getCategoryName = (cat: { name?: string | { ar?: string; en?: string }; name_ar?: string; name_en?: string } | undefined) => {
    if (!cat) return "N/A"
    const catName = cat.name
    if (typeof catName === 'string') return catName
    return (language === 'ar' ? catName?.ar : catName?.en) || cat.name_en || cat.name_ar || "N/A"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/services">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{t("services.details")}</h1>
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
            <CardTitle>{t("services.basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">{t("common.id")}</Label>
              <p className="text-lg font-semibold">{service.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("services.nameEnLabel")}</Label>
              <p className="text-lg">{getName(service.name_en || service.name)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("services.nameArLabel")}</Label>
              <p className="text-lg">{typeof service.name === 'object' ? service.name?.ar : service.name_ar || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("services.descriptionEnLabel")}</Label>
              <p className="text-muted-foreground">{getDescription(service.description_en || service.description)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("services.descriptionArLabel")}</Label>
              <p className="text-muted-foreground">{typeof service.description === 'object' ? service.description?.ar : service.description_ar || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("services.category")}</Label>
              <p className="text-lg">
                {getCategoryName(service.category)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("common.image")}</CardTitle>
          </CardHeader>
          <CardContent>
            {service.image ? (
              <img
                src={service.image.startsWith('http') ? service.image : `https://galasaty.teamqeematech.site/storage/${service.image}`}
                alt={getName(service.name_en || service.name)}
                className="h-48 w-full rounded-lg object-cover"
              />
            ) : (
              <p className="text-muted-foreground">{t("services.noImage")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("services.editService")}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name_ar">{t("services.nameAr")}</Label>
              <Input
                id="name_ar"
                name="name_ar"
                defaultValue={typeof service.name === 'object' ? service.name?.ar : service.name_ar || ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">{t("services.nameEn")}</Label>
              <Input
                id="name_en"
                name="name_en"
                defaultValue={typeof service.name === 'object' ? service.name?.en : service.name_en || service.name || ""}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description_ar">{t("services.descriptionAr")}</Label>
              <Input
                id="description_ar"
                name="description_ar"
                defaultValue={typeof service.description === 'object' ? service.description?.ar : service.description_ar || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_en">{t("services.descriptionEn")}</Label>
              <Input
                id="description_en"
                name="description_en"
                defaultValue={typeof service.description === 'object' ? service.description?.en : service.description_en || service.description || ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category_id">{t("services.category")}</Label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={service.category_id || ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">{t("services.selectCategory")}</option>
              {categories.map((cat) => {
                const catName = typeof cat.name === 'string' 
                  ? cat.name 
                  : (language === 'ar' ? cat.name?.ar : cat.name?.en) || cat.name_en || cat.name_ar || cat.name || `Category ${cat.id}`;
                return (
                  <option key={cat.id} value={cat.id}>
                    {catName}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">{t("common.image")}</Label>
            <Input id="image" name="image" type="file" accept="image/*" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("services.update")}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t("common.delete")}
      >
        <div className="space-y-4">
          <p>{t("services.deleteConfirm")}</p>
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

