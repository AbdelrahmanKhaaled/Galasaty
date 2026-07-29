import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/contexts/LanguageContext"
import { categoriesAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Category {
  id: number
  name?: string | { ar?: string; en?: string }
  name_ar?: string
  name_en?: string
  description?: string | { ar?: string; en?: string }
  description_ar?: string
  description_en?: string
  image?: string
  icon?: string
}

export function SingleCategory() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const fetchCategory = async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await categoriesAPI.getOne(Number(id))
      setCategory(response.data?.data || response.data)
    } catch (error) {
      console.error("Error fetching category:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategory()
  }, [id, language])

  const handleDelete = async () => {
    if (!category) return
    try {
      await categoriesAPI.delete(category.id)
      navigate("/dashboard/categories")
    } catch (error) {
      console.error("Error deleting category:", error)
      alert(t("categories.deleteError"))
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!category) return
    const formData = new FormData(e.currentTarget)
    try {
      await categoriesAPI.update(category.id, formData)
      setIsEditModalOpen(false)
      fetchCategory()
    } catch (error) {
      console.error("Error updating category:", error)
      alert(t("categories.saveError"))
    }
  }

  if (loading) {
    return <div className="text-center py-8">{t("common.loading")}</div>
  }

  if (!category) {
    return (
      <div className="text-center py-8">
        <p>{t("categories.notFound")}</p>
        <Link to="/dashboard/categories">
          <Button variant="outline" className="mt-4">
            {t("categories.backToCategories")}
          </Button>
        </Link>
      </div>
    )
  }

  const getName = (name: string | { ar?: string; en?: string } | undefined) => {
    if (!name) return "N/A"
    if (typeof name === 'string') return name
    return (language === 'ar' ? name.ar : name.en)  || "N/A"
  }

  const getDescription = (desc: string | { ar?: string; en?: string } | undefined) => {
    if (!desc) return "N/A"
    if (typeof desc === 'string') return desc
    return (language === 'ar' ? desc.ar : desc.en) || "N/A"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/categories">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">
            {typeof category.name === 'object' 
              ? (language === 'ar' ? category.name?.ar : category.name?.en) || category.name?.en || category.name?.ar || t("categories.details")
              : (category.name_ar || category.name_en || category.name || t("categories.details"))}
          </h1>
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
            <CardTitle>{t("categories.basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">{t("common.id")}</Label>
              <p className="text-lg font-semibold">{category.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("categories.nameEnLabel")}</Label>
              <p className="text-lg">
                {typeof category.name === 'object' 
                  ? (category.name?.en || "N/A")
                  : (category.name_en || (typeof category.name === 'string' ? category.name : "N/A"))}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("categories.nameArLabel")}</Label>
              <p className="text-lg">
                {typeof category.name === 'object' 
                  ? (category.name?.ar || "N/A")
                  : (category.name_ar || "N/A")}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("categories.descriptionEnLabel")}</Label>
              <p className="text-muted-foreground">{getDescription(category.description_en || category.description)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("categories.descriptionArLabel")}</Label>
              <p className="text-muted-foreground">{typeof category.description === 'object' ? category.description?.ar : category.description_ar || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("categories.images")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.image && (
              <div>
                <Label className="text-muted-foreground">{t("common.image")}</Label>
                <div className="mt-2">
                  <img
                    src={category.image.startsWith('http') ? category.image : `https://galasaty.teamqeematech.site/storage/${category.image}`}
                    alt={getName(category.name_en || category.name)}
                    className="h-48 w-full rounded-lg object-cover"
                  />
                </div>
              </div>
            )}
            {category.icon && (
              <div>
                <Label className="text-muted-foreground">{t("common.icon")}</Label>
                <div className="mt-2">
                  <img
                    src={category.icon.startsWith('http') ? category.icon : `https://galasaty.teamqeematech.site/storage/${category.icon}`}
                    alt="Icon"
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("categories.editCategory")}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name_ar">{t("categories.nameAr")}</Label>
              <Input
                id="name_ar"
                name="name_ar"
                defaultValue={typeof category.name === 'object' ? category.name?.ar : category.name_ar || ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">{t("categories.nameEn")}</Label>
              <Input
                id="name_en"
                name="name_en"
                defaultValue={typeof category.name === 'object' ? category.name?.en : category.name_en || category.name || ""}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description_ar">{t("categories.descriptionAr")}</Label>
              <Input
                id="description_ar"
                name="description_ar"
                defaultValue={typeof category.description === 'object' ? category.description?.ar : category.description_ar || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_en">{t("categories.descriptionEn")}</Label>
              <Input
                id="description_en"
                name="description_en"
                defaultValue={typeof category.description === 'object' ? category.description?.en : category.description_en || category.description || ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">{t("common.image")}</Label>
            <Input id="image" name="image" type="file" accept="image/*" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">{t("common.icon")}</Label>
            <Input id="icon" name="icon" type="file" accept="image/*" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("categories.update")}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t("common.delete")}
      >
        <div className="space-y-4">
          <p>{t("categories.deleteConfirm")}</p>
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

