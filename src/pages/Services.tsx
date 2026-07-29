import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/contexts/LanguageContext"
import { servicesAPI, categoriesAPI } from "@/lib/api"
import { DataTable } from "@/components/DataTable"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

// interface Service {
//   id: number
//   name_ar?: string
//   name_en?: string
//   description_ar?: string
//   description_en?: string
//   image?: string
//   category_id?: number
//   category?: { name_en?: string; name_ar?: string }
// }

interface Service {
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
  category_id?: number
  category?: { 
    name?: {
      ar?: string;
      en?: string;
    };
  };
}

export function Services() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    category_id: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await servicesAPI.getAll()
      setServices(response.data?.data || [])
    } catch (error) {
      console.error("Error fetching services:", error)
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
    fetchServices()
    fetchCategories()
  }, [language])

  const handleAdd = () => {
    setEditingService(null)
    setFormData({
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      category_id: "",
    })
    setSelectedImage(null)
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    // Populate form with existing data
    // Priority: flat format (name_ar, name_en) > object format (name.ar, name.en) > string format
    let nameAr = "";
    let nameEn = "";
    let descAr = "";
    let descEn = "";
    
    // Extract name - prioritize flat format first
    if (service.name_ar !== undefined) {
      nameAr = service.name_ar || "";
    } else if (typeof service.name === 'object' && service.name !== null) {
      nameAr = service.name.ar || "";
    }
    
    if (service.name_en !== undefined) {
      nameEn = service.name_en || "";
    } else if (typeof service.name === 'object' && service.name !== null) {
      nameEn = service.name.en || "";
    } else if (typeof service.name === 'string') {
      // If name is a string, we can't determine if it's ar or en, so don't assign it
      // This handles the case where API returns localized string based on Accept-Language
    }
    
    // Extract description - prioritize flat format first
    if (service.description_ar !== undefined) {
      descAr = service.description_ar || "";
    } else if (typeof service.description === 'object' && service.description !== null) {
      descAr = service.description.ar || "";
    }
    
    if (service.description_en !== undefined) {
      descEn = service.description_en || "";
    } else if (typeof service.description === 'object' && service.description !== null) {
      descEn = service.description.en || "";
    } else if (typeof service.description === 'string') {
      // If description is a string, we can't determine if it's ar or en, so don't assign it
      // This handles the case where API returns localized string based on Accept-Language
    }
    
    console.log("Editing service:", service)
    console.log("Extracted values:", { nameAr, nameEn, descAr, descEn })
    
    setFormData({
      name_ar: nameAr,
      name_en: nameEn,
      description_ar: descAr,
      description_en: descEn,
      category_id: service.category_id?.toString() || "",
    })
    
    // Set image preview
    setSelectedImage(null)
    if (service.image) {
      const imageUrl = service.image.startsWith('http') 
        ? service.image 
        : `https://galasaty.teamqeematech.site/storage/${service.image}`
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
      setImagePreview(editingService?.image ? (editingService.image.startsWith('http') ? editingService.image : `https://galasaty.teamqeematech.site/storage/${editingService.image}`) : null)
    }
  }

  const handleView = (service: Service) => {
    navigate(`/dashboard/services/${service.id}`)
  }

  const handleDelete = async (service: Service) => {
    if (window.confirm(t("services.deleteService"))) {
      try {
        await servicesAPI.delete(service.id)
        fetchServices()
      } catch (error) {
        console.error("Error deleting service:", error)
        alert(t("services.deleteError"))
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
    if (editingService) {
      const nameAr = submitFormData.get("name_ar") as string;
      const nameEn = submitFormData.get("name_en") as string;
      const descriptionAr = submitFormData.get("description_ar") as string;
      const descriptionEn = submitFormData.get("description_en") as string;
      const categoryId = submitFormData.get("category_id") as string;

      // Get old values (handle both object and flat formats)
      const oldNameAr = typeof editingService.name === 'object' ? editingService.name?.ar : editingService.name_ar;
      const oldNameEn = typeof editingService.name === 'object' ? editingService.name?.en : editingService.name_en;
      const oldDescAr = typeof editingService.description === 'object' ? editingService.description?.ar : editingService.description_ar;
      const oldDescEn = typeof editingService.description === 'object' ? editingService.description?.en : editingService.description_en;

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
      // Preserve category_id if not provided
      if ((!categoryId || categoryId === "") && editingService.category_id) {
        submitFormData.set("category_id", editingService.category_id.toString())
      }
    }
    
    try {
      if (editingService) {
        await servicesAPI.update(editingService.id, submitFormData)
      } else {
        await servicesAPI.create(submitFormData)
      }
      setIsModalOpen(false)
      setEditingService(null)
      setFormData({
        name_ar: "",
        name_en: "",
        description_ar: "",
        description_en: "",
        category_id: "",
      })
      setSelectedImage(null)
      setImagePreview(null)
      fetchServices()
    } catch (error) {
      console.error("Error saving service:", error)
      alert(t("services.saveError"))
    }
  }

  const columns = [
    { key: "id", label: t("common.id") },
    {
      key: "name",
      label: t("common.name"),
      render: (service: Service) => (
        <div className="flex items-center gap-3">
          {service.image && (
            <img 
              src={service.image.startsWith('http') ? service.image : `https://galasaty.teamqeematech.site/storage/${service.image}`} 
              alt={service.name?.en || service.name?.ar || "Service"} 
              className="h-10 w-10 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40'
              }}
            />
          )}
          <div>
            <div className="font-medium">
              {typeof service.name === 'string' 
                ? service.name 
                : (language === 'ar' ? service.name?.ar : service.name?.en) || service.name?.en || service.name?.ar || "N/A"}
            </div>
            {typeof service.name === 'object' && service.name?.ar && service.name?.en && (
              <div className="text-xs text-muted-foreground">
                {language === 'ar' ? service.name.en : service.name.ar}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: t("services.category"),
      render: (service: Service) => {
        const catName = service.category?.name;
        if (typeof catName === 'string') return catName;
        return (language === 'ar' ? catName?.ar : catName?.en) || catName?.en || catName?.ar || "N/A";
      },
    },
    {
      key: "description",
      label: t("common.description"),
      render: (service: Service) => (
        <div className="max-w-md truncate">
          {typeof service.description === 'string' 
            ? service.description 
            : (language === 'ar' ? service.description?.ar : service.description?.en) || service.description?.en || service.description?.ar || "N/A"}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("services.title")}</h1>
      </div>

      <DataTable
        data={services}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onAdd={handleAdd}
        addLabel={t("services.addService")}
        isLoading={loading}
        getItemId={(item) => item.id}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
          setFormData({
            name_ar: "",
            name_en: "",
            description_ar: "",
            description_en: "",
            category_id: "",
          });
          setSelectedImage(null);
          setImagePreview(null);
        }}
        title={editingService ? t("services.editService") : t("services.addService")}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name_ar">{t("services.nameAr")}</Label>
            <Input
              id="name_ar"
              name="name_ar"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name_en">{t("services.nameEn")}</Label>
            <Input
              id="name_en"
              name="name_en"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_ar">{t("services.descriptionAr")}</Label>
            <Input
              id="description_ar"
              name="description_ar"
              value={formData.description_ar}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_en">{t("services.descriptionEn")}</Label>
            <Input
              id="description_en"
              name="description_en"
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category_id">{t("services.category")}</Label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">{t("services.selectCategory")}</option>
              {categories.map((cat) => {
                const catName = typeof cat.name === 'string' 
                  ? cat.name 
                  : (language === 'ar' ? cat.name?.ar : cat.name?.en) || cat.name?.en || cat.name?.ar || `Category ${cat.id}`;
                return (
                  <option key={cat.id} value={cat.id}>
                    {catName}
                  </option>
                );
              })}
            </select>
          </div>
          {/* Professional Image Upload Section */}
          <div className="flex flex-col items-center space-y-4 border-t pt-4">
            <div className="relative">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-lg ring-2 ring-primary/20">
                {(imagePreview || editingService?.image) ? (
                  <img
                    src={imagePreview || (editingService?.image?.startsWith('http') ? editingService.image : `https://galasaty.teamqeematech.site/storage/${editingService?.image}`)}
                    alt={typeof editingService?.name === 'object' ? (editingService.name?.en || editingService.name?.ar || "Service") : (editingService?.name || "Service")}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=S'
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 text-4xl font-semibold text-primary">
                    S
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
                    {(imagePreview || editingService?.image) ? t("profile.changeImage") : t("profile.uploadImage")}
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





