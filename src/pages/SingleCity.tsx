import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/contexts/LanguageContext"
import { citiesAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface City {
  id: number
  name?: string | { ar?: string; en?: string }
  name_ar?: string
  name_en?: string
  description?: string | { ar?: string; en?: string }
  description_ar?: string
  description_en?: string
  image?: string
}

export function SingleCity() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [city, setCity] = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const fetchCity = async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await citiesAPI.getOne(Number(id))
      setCity(response.data?.data || response.data)
    } catch (error) {
      console.error("Error fetching city:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCity()
  }, [id, language])

  const handleDelete = async () => {
    if (!city) return
    try {
      await citiesAPI.delete(city.id)
      navigate("/dashboard/cities")
    } catch (error) {
      console.error("Error deleting city:", error)
      alert(t("cities.deleteError"))
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!city) return
    const formData = new FormData(e.currentTarget)
    try {
      await citiesAPI.update(city.id, formData)
      setIsEditModalOpen(false)
      fetchCity()
    } catch (error) {
      console.error("Error updating city:", error)
      alert(t("cities.saveError"))
    }
  }

  if (loading) {
    return <div className="text-center py-8">{t("common.loading")}</div>
  }

  if (!city) {
    return (
      <div className="text-center py-8">
        <p>{t("cities.notFound")}</p>
        <Link to="/dashboard/cities">
          <Button variant="outline" className="mt-4">
            {t("cities.backToCities")}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/cities">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{t("cities.details")}</h1>
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
            <CardTitle>{t("cities.basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">{t("common.id")}</Label>
              <p className="text-lg font-semibold">{city.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("cities.nameEnLabel")}</Label>
              <p className="text-lg">{getName(city.name_en || city.name)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("cities.nameArLabel")}</Label>
              <p className="text-lg">{typeof city.name === 'object' ? city.name?.ar : city.name_ar || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("cities.descriptionEnLabel")}</Label>
              <p className="text-muted-foreground">{getDescription(city.description_en || city.description)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("cities.descriptionArLabel")}</Label>
              <p className="text-muted-foreground">{typeof city.description === 'object' ? city.description?.ar : city.description_ar || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("common.image")}</CardTitle>
          </CardHeader>
          <CardContent>
            {city.image ? (
              <img
                src={city.image.startsWith('http') ? city.image : `https://galasaty.teamqeematech.site/storage/${city.image}`}
                alt={getName(city.name_en || city.name)}
                className="h-48 w-full rounded-lg object-cover"
              />
            ) : (
              <p className="text-muted-foreground">{t("cities.noImage")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("cities.editCity")}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name_ar">{t("cities.nameAr")}</Label>
              <Input
                id="name_ar"
                name="name_ar"
                defaultValue={typeof city.name === 'object' ? city.name?.ar : city.name_ar || ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">{t("cities.nameEn")}</Label>
              <Input
                id="name_en"
                name="name_en"
                defaultValue={typeof city.name === 'object' ? city.name?.en : city.name_en || city.name || ""}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description_ar">{t("cities.descriptionAr")}</Label>
              <Input
                id="description_ar"
                name="description_ar"
                defaultValue={typeof city.description === 'object' ? city.description?.ar : city.description_ar || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_en">{t("cities.descriptionEn")}</Label>
              <Input
                id="description_en"
                name="description_en"
                defaultValue={typeof city.description === 'object' ? city.description?.en : city.description_en || city.description || ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">{t("common.image")}</Label>
            <Input id="image" name="image" type="file" accept="image/*" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("cities.update")}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t("common.delete")}
      >
        <div className="space-y-4">
          <p>{t("cities.deleteConfirm")}</p>
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

