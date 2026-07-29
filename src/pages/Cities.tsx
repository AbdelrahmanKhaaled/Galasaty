import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/contexts/LanguageContext"
import { citiesAPI } from "@/lib/api"
import { DataTable } from "@/components/DataTable"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

// interface City {
//   id: number
//   name_ar?: string
//   name_en?: string
//   description_ar?: string
//   description_en?: string
//   image?: string
// }

interface City {
  id: number
  name?: {
    ar?: string;
    en?: string;
  } | string;
  name_ar?: string;
  name_en?: string;
  description?: {
    ar?: string;
    en?: string;
  } | string;
  description_ar?: string;
  description_en?: string;
  image?: string
}

export function Cities() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const fetchCities = async () => {
    try {
      setLoading(true)
      const response = await citiesAPI.getAll()
      setCities(response.data?.data || [])
    } catch (error) {
      console.error("Error fetching cities:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCities()
  }, [language])

  const handleAdd = () => {
    setEditingCity(null)
    setFormData({
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
    })
    setSelectedImage(null)
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const handleEdit = (city: City) => {
    setEditingCity(city)
    // Populate form with existing data
    // Priority: flat format (name_ar, name_en) > object format (name.ar, name.en) > string format
    let nameAr = "";
    let nameEn = "";
    let descAr = "";
    let descEn = "";
    
    // Extract name - prioritize flat format first
    if (city.name_ar !== undefined) {
      nameAr = city.name_ar || "";
    } else if (typeof city.name === 'object' && city.name !== null) {
      nameAr = city.name.ar || "";
    }
    
    if (city.name_en !== undefined) {
      nameEn = city.name_en || "";
    } else if (typeof city.name === 'object' && city.name !== null) {
      nameEn = city.name.en || "";
    } else if (typeof city.name === 'string') {
      // If name is a string, we can't determine if it's ar or en, so don't assign it
      // This handles the case where API returns localized string based on Accept-Language
    }
    
    // Extract description - prioritize flat format first
    if (city.description_ar !== undefined) {
      descAr = city.description_ar || "";
    } else if (typeof city.description === 'object' && city.description !== null) {
      descAr = city.description.ar || "";
    }
    
    if (city.description_en !== undefined) {
      descEn = city.description_en || "";
    } else if (typeof city.description === 'object' && city.description !== null) {
      descEn = city.description.en || "";
    } else if (typeof city.description === 'string') {
      // If description is a string, we can't determine if it's ar or en, so don't assign it
      // This handles the case where API returns localized string based on Accept-Language
    }
    
    console.log("Editing city:", city)
    console.log("Extracted values:", { nameAr, nameEn, descAr, descEn })
    
    setFormData({
      name_ar: nameAr,
      name_en: nameEn,
      description_ar: descAr,
      description_en: descEn,
    })
    
    // Set image preview
    setSelectedImage(null)
    if (city.image) {
      const imageUrl = city.image.startsWith('http') 
        ? city.image 
        : `https://galasaty.teamqeematech.site/storage/${city.image}`
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
      setImagePreview(editingCity?.image ? (editingCity.image.startsWith('http') ? editingCity.image : `https://galasaty.teamqeematech.site/storage/${editingCity.image}`) : null)
    }
  }

  const handleView = (city: City) => {
    navigate(`/dashboard/cities/${city.id}`)
  }

  const handleDelete = async (city: City) => {
    if (window.confirm(t("cities.deleteCity"))) {
      try {
        await citiesAPI.delete(city.id)
        fetchCities()
      } catch (error) {
        console.error("Error deleting city:", error)
        alert(t("cities.deleteError"))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const submitFormData = new FormData(e.currentTarget)
    
    // Add selected image if a new one was selected
    if (selectedImage) {
      submitFormData.set("image", selectedImage)
    }
    
    // If editing, preserve old data for fields that are empty or not provided
    if (editingCity) {
      const nameAr = submitFormData.get("name_ar") as string;
      const nameEn = submitFormData.get("name_en") as string;
      const descriptionAr = submitFormData.get("description_ar") as string;
      const descriptionEn = submitFormData.get("description_en") as string;

      // Get old values (handle both object and flat formats)
      const oldNameAr = typeof editingCity.name === 'object' ? editingCity.name?.ar : editingCity.name_ar;
      const oldNameEn = typeof editingCity.name === 'object' ? editingCity.name?.en : editingCity.name_en;
      const oldDescAr = typeof editingCity.description === 'object' ? editingCity.description?.ar : editingCity.description_ar;
      const oldDescEn = typeof editingCity.description === 'object' ? editingCity.description?.en : editingCity.description_en;

      // Preserve old name values if form field is empty
      if ((!nameAr || nameAr.trim() === "") && oldNameAr) {
        submitFormData.set("name_ar", oldNameAr)
      }
      if ((!nameEn || nameEn.trim() === "") && oldNameEn) {
        submitFormData.set("name_en", oldNameEn)
      }
      // Preserve old description values if form field is empty
      if ((!descriptionAr || descriptionAr.trim() === "") && oldDescAr) {
        submitFormData.set("description_ar", oldDescAr)
      }
      if ((!descriptionEn || descriptionEn.trim() === "") && oldDescEn) {
        submitFormData.set("description_en", oldDescEn)
      }
    }
    
    try {
      if (editingCity) {
        await citiesAPI.update(editingCity.id, submitFormData)
      } else {
        await citiesAPI.create(submitFormData)
      }
      setIsModalOpen(false)
      setEditingCity(null)
      setFormData({
        name_ar: "",
        name_en: "",
        description_ar: "",
        description_en: "",
      })
      setSelectedImage(null)
      setImagePreview(null)
      fetchCities()
    } catch (error) {
      console.error("Error saving city:", error)
      alert(t("cities.saveError"))
    }
  }

  const columns = [
    { key: "id", label: t("common.id") },
    {
      key: "name",
      label: t("common.name"),
      render: (city: City) => (
        <div className="flex items-center gap-3">
          {city.image && (
            <img 
              src={city.image.startsWith('http') ? city.image : `https://galasaty.teamqeematech.site/storage/${city.image}`} 
              alt={typeof city.name === 'object' ? (city.name?.en || city.name?.ar || "City") : (city.name || "City")} 
              className="h-10 w-10 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40'
              }}
            />
          )}
          <div>
            <div className="font-medium">
              {typeof city.name === 'string' 
                ? city.name 
                : (language === 'ar' ? city.name?.ar : city.name?.en) || city.name?.en || city.name?.ar || "N/A"}
            </div>
            {typeof city.name === 'object' && city.name?.ar && city.name?.en && (
              <div className="text-xs text-muted-foreground">
                {language === 'ar' ? city.name.en : city.name.ar}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: t("common.description"),
      render: (city: City) => (
        <div className="max-w-md truncate">
          {typeof city.description === 'string' 
            ? city.description 
            : (language === 'ar' ? city.description?.ar : city.description?.en) || city.description?.en || city.description?.ar || "N/A"}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("cities.title")}</h1>
      </div>

      <DataTable
        data={cities}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onAdd={handleAdd}
        addLabel={t("cities.addCity")}
        isLoading={loading}
        getItemId={(item) => item.id}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCity(null);
          setFormData({
            name_ar: "",
            name_en: "",
            description_ar: "",
            description_en: "",
          });
          setSelectedImage(null);
          setImagePreview(null);
        }}
        title={editingCity ? t("cities.editCity") : t("cities.addCity")}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name_ar">{t("cities.nameAr")}</Label>
            <Input
              id="name_ar"
              name="name_ar"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name_en">{t("cities.nameEn")}</Label>
            <Input
              id="name_en"
              name="name_en"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_ar">{t("cities.descriptionAr")}</Label>
            <Input
              id="description_ar"
              name="description_ar"
              value={formData.description_ar}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_en">{t("cities.descriptionEn")}</Label>
            <Input
              id="description_en"
              name="description_en"
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            />
          </div>
          {/* Professional Image Upload Section */}
          <div className="flex flex-col items-center space-y-4 border-t pt-4">
            <div className="relative">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-lg ring-2 ring-primary/20">
                {(imagePreview || editingCity?.image) ? (
                  <img
                    src={imagePreview || (editingCity?.image?.startsWith('http') ? editingCity.image : `https://galasaty.teamqeematech.site/storage/${editingCity?.image}`)}
                    alt={typeof editingCity?.name === 'object' ? (editingCity.name?.en || editingCity.name?.ar || "City") : (editingCity?.name || "City")}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=CI'
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 text-4xl font-semibold text-primary">
                    CI
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
                    {(imagePreview || editingCity?.image) ? t("profile.changeImage") : t("profile.uploadImage")}
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