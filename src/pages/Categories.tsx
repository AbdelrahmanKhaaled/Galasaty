import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { categoriesAPI } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// interface Category {
//   id: number;
//   name_ar?: string;
//   name_en?: string;
//   description_ar?: string;
//   description_en?: string;
//   image?: string;
//   icon?: string;
// }

interface Category {
  id: number;
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
  image?: string;
  icon?: string;
}

export function Categories() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll({ search });
      setCategories(response.data?.data || []);
      console.log("Categories:", response.data?.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search, language]);

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
    });
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedIcon(null);
    setIconPreview(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    // Populate form with existing data
    // Priority: flat format (name_ar, name_en) > object format (name.ar, name.en) > string format
    let nameAr = "";
    let nameEn = "";
    let descAr = "";
    let descEn = "";
    
    // Extract name - prioritize flat format first
    if (category.name_ar !== undefined) {
      nameAr = category.name_ar || "";
    } else if (typeof category.name === 'object' && category.name !== null) {
      nameAr = category.name.ar || "";
    }
    
    if (category.name_en !== undefined) {
      nameEn = category.name_en || "";
    } else if (typeof category.name === 'object' && category.name !== null) {
      nameEn = category.name.en || "";
    } else if (typeof category.name === 'string') {
      // If name is a string, we can't determine if it's ar or en, so don't assign it
      // This handles the case where API returns localized string based on Accept-Language
    }
    
    // Extract description - prioritize flat format first
    if (category.description_ar !== undefined) {
      descAr = category.description_ar || "";
    } else if (typeof category.description === 'object' && category.description !== null) {
      descAr = category.description.ar || "";
    }
    
    if (category.description_en !== undefined) {
      descEn = category.description_en || "";
    } else if (typeof category.description === 'object' && category.description !== null) {
      descEn = category.description.en || "";
    } else if (typeof category.description === 'string') {
      // If description is a string, we can't determine if it's ar or en, so don't assign it
      // This handles the case where API returns localized string based on Accept-Language
    }
    
    console.log("Editing category:", category);
    console.log("Extracted values:", { nameAr, nameEn, descAr, descEn });
    
    setFormData({
      name_ar: nameAr,
      name_en: nameEn,
      description_ar: descAr,
      description_en: descEn,
    });
    
    // Set image preview
    setSelectedImage(null);
    if (category.image) {
      const imageUrl = category.image.startsWith('http') 
        ? category.image 
        : `https://galasaty.teamqeematech.site/storage/${category.image}`;
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
    
    // Set icon preview
    setSelectedIcon(null);
    if (category.icon) {
      const iconUrl = category.icon.startsWith('http') 
        ? category.icon 
        : `https://galasaty.teamqeematech.site/storage/${category.icon}`;
      setIconPreview(iconUrl);
    } else {
      setIconPreview(null);
    }
    
    setIsModalOpen(true);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreview(editingCategory?.image ? (editingCategory.image.startsWith('http') ? editingCategory.image : `https://galasaty.teamqeematech.site/storage/${editingCategory.image}`) : null);
    }
  };
  
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedIcon(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedIcon(null);
      setIconPreview(editingCategory?.icon ? (editingCategory.icon.startsWith('http') ? editingCategory.icon : `https://galasaty.teamqeematech.site/storage/${editingCategory.icon}`) : null);
    }
  };

  const handleView = (category: Category) => {
    navigate(`/dashboard/categories/${category.id}`);
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm(t("categories.deleteCategory"))) {
      try {
        await categoriesAPI.delete(category.id);
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert(t("categories.deleteError"));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitFormData = new FormData(e.currentTarget);

    // Add selected image if a new one was selected
    if (selectedImage) {
      submitFormData.set("image", selectedImage);
    }
    
    // Add selected icon if a new one was selected
    if (selectedIcon) {
      submitFormData.set("icon", selectedIcon);
    }

    // If editing, preserve old data for fields that are empty or not provided
    if (editingCategory) {
      const nameAr = submitFormData.get("name_ar") as string;
      const nameEn = submitFormData.get("name_en") as string;
      const descriptionAr = submitFormData.get("description_ar") as string;
      const descriptionEn = submitFormData.get("description_en") as string;

      // Get old values (handle both object and flat formats)
      const oldNameAr = typeof editingCategory.name === 'object' ? editingCategory.name?.ar : editingCategory.name_ar;
      const oldNameEn = typeof editingCategory.name === 'object' ? editingCategory.name?.en : editingCategory.name_en;
      const oldDescAr = typeof editingCategory.description === 'object' ? editingCategory.description?.ar : editingCategory.description_ar;
      const oldDescEn = typeof editingCategory.description === 'object' ? editingCategory.description?.en : editingCategory.description_en;

      // Preserve old name values if form field is empty
      if ((!nameAr || nameAr.trim() === "") && oldNameAr) {
        submitFormData.set("name_ar", oldNameAr);
      }
      if ((!nameEn || nameEn.trim() === "") && oldNameEn) {
        submitFormData.set("name_en", oldNameEn);
      }
      // Preserve old description values if form field is empty
      if ((!descriptionAr || descriptionAr.trim() === "") && oldDescAr) {
        submitFormData.set("description_ar", oldDescAr);
      }
      if ((!descriptionEn || descriptionEn.trim() === "") && oldDescEn) {
        submitFormData.set("description_en", oldDescEn);
      }
    }

    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, submitFormData);
      } else {
        await categoriesAPI.create(submitFormData);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({
        name_ar: "",
        name_en: "",
        description_ar: "",
        description_en: "",
      });
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedIcon(null);
      setIconPreview(null);
      fetchCategories();
      } catch (error) {
        console.error("Error saving category:", error);
        alert(t("categories.saveError"));
      }
  };

  const columns = [
    { key: "id", label: t("common.id") },
    {
      key: "name",
      label: t("common.name"),
      render: (category: Category) => (
        <div className="flex items-center gap-3">
          {category.image && (
            <img
              src={category.image.startsWith('http') ? category.image : `https://galasaty.teamqeematech.site/storage/${category.image}`}
              alt={typeof category.name === 'object' ? (category.name?.en || category.name?.ar || "Category") : (category.name || category.name_en || category.name_ar || "Category")}
              className="h-10 w-10 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40'
              }}
            />
          )}
          <div>
            <div className="font-medium">
              {typeof category.name === 'string' 
                ? category.name 
                : (language === 'ar' ? category.name?.ar : category.name?.en) || category.name?.en || category.name?.ar || "N/A"}
            </div>
            {typeof category.name === 'object' && category.name?.ar && category.name?.en && (
              <div className="text-xs text-muted-foreground">
                {language === 'ar' ? category.name.en : category.name.ar}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: t("common.description"),
      render: (category: Category) => (
        <div className="max-w-md truncate">
          {typeof category.description === 'string' 
            ? category.description 
            : (language === 'ar' ? category.description?.ar : category.description?.en) || category.description?.en || category.description?.ar || "N/A"}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">{t("categories.title")}</h1>
        <Input
          placeholder={t("common.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-64"
        />
      </div>

      <DataTable
        data={categories}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onAdd={handleAdd}
        addLabel={t("categories.addCategory")}
        isLoading={loading}
        getItemId={(item) => item.id}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          setFormData({
            name_ar: "",
            name_en: "",
            description_ar: "",
            description_en: "",
          });
          setSelectedImage(null);
          setImagePreview(null);
          setSelectedIcon(null);
          setIconPreview(null);
        }}
        title={editingCategory ? t("categories.editCategory") : t("categories.addCategory")}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name_ar">{t("categories.nameAr")}</Label>
            <Input
              id="name_ar"
              name="name_ar"
              value={formData.name_ar}  
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name_en">{t("categories.nameEn")}</Label>
            <Input
              id="name_en"
              name="name_en"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_ar">{t("categories.descriptionAr")}</Label>
            <Input
              id="description_ar"
              name="description_ar"
              value={formData.description_ar}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_en">{t("categories.descriptionEn")}</Label>
            <Input
              id="description_en"
              name="description_en"
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            />
          </div>
          {/* Professional Image Upload Section */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div className="flex flex-col items-center space-y-4">
                <Label className="text-base font-semibold mb-2">{t("common.image")}</Label>
                <div className="relative">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-lg ring-2 ring-primary/20">
                    {(imagePreview || editingCategory?.image) ? (
                      <img
                        src={imagePreview || (editingCategory?.image?.startsWith('http') ? editingCategory.image : `https://galasaty.teamqeematech.site/storage/${editingCategory?.image}`)}
                        alt={typeof editingCategory?.name === 'object' ? (editingCategory.name?.en || editingCategory.name?.ar || "Category") : (editingCategory?.name || "Category")}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=C'
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 text-4xl font-semibold text-primary">
                        C
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
                        {(imagePreview || editingCategory?.image) ? t("profile.changeImage") : t("profile.uploadImage")}
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
              {/* Icon Upload */}
              <div className="flex flex-col items-center space-y-4">
                <Label className="text-base font-semibold mb-2">{t("common.icon")}</Label>
                <div className="relative">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-lg ring-2 ring-primary/20">
                    {(iconPreview || editingCategory?.icon) ? (
                      <img
                        src={iconPreview || (editingCategory?.icon?.startsWith('http') ? editingCategory.icon : `https://galasaty.teamqeematech.site/storage/${editingCategory?.icon}`)}
                        alt="Icon"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=I'
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 text-4xl font-semibold text-primary">
                        I
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
                  <Label htmlFor="icon" className="cursor-pointer">
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
                        {(iconPreview || editingCategory?.icon) ? t("profile.changeImage") : t("profile.uploadImage")}
                      </span>
                    </div>
                  </Label>
                  <Input
                    id="icon"
                    name="icon"
                    type="file"
                    accept="image/*"
                    onChange={handleIconChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.save")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
