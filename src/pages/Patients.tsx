import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { patientsAPI } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Patient {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  image?: string;
  wallet?: {
    id?: number;
    balance?: string;
    freeze?: string;
  };
}

export function Patients() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientsAPI.getAll({
        search,
        status: statusFilter,
      });
      setPatients(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, statusFilter]);

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setSelectedImage(null);
    // Set image preview
    if (patient.image) {
      const imageUrl = patient.image.startsWith('http') 
        ? patient.image 
        : `https://galasaty.teamqeematech.site/storage/${patient.image}`;
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
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
      setImagePreview(editingPatient?.image ? (editingPatient.image.startsWith('http') ? editingPatient.image : `https://galasaty.teamqeematech.site/storage/${editingPatient.image}`) : null);
    }
  };

  const handleDelete = async (patient: Patient) => {
    if (
      window.confirm(
        `${t("patients.deletePatient")} ${patient.name || patient.email}?`
      )
    ) {
      try {
        console.log("Attempting to delete patient:", patient.id);
        await patientsAPI.delete(patient.id);
        console.log("Patient deleted successfully");
        fetchPatients();
      } catch (error: any) {
        console.error("Error deleting patient:", error);
        console.error("Error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        
        // Extract error message from response
        let errorMessage = "Failed to delete patient.";
        
        if (error.response?.data) {
          // Try different possible error message locations
          errorMessage = error.response.data.message || 
                        error.response.data.error || 
                        error.response.data.errors?.message ||
                        (typeof error.response.data === 'string' ? error.response.data : errorMessage);
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Show user-friendly error message
        alert(errorMessage);
      }
    }
  };

  const handleToggle = async (patient: Patient) => {
    try {
      await patientsAPI.toggle(patient.id);
      fetchPatients();
    } catch (error) {
      console.error("Error toggling patient:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Add selected image if a new one was selected
    if (selectedImage) {
      formData.set("image", selectedImage);
    }

    try {
      if (editingPatient) {
        await patientsAPI.update(editingPatient.id, formData);
        setIsModalOpen(false);
        setSelectedImage(null);
        setImagePreview(null);
        fetchPatients();
      } else {
        console.error("Cannot create patient from this page");
        alert(t("patients.saveError"));
      }
    } catch (error) {
      console.error("Error updating patient:", error);
      alert(t("patients.saveError"));
    }
  };

  const columns = [
    {
      key: "id",
      label: t("common.id"),
    },
    {
      key: "name",
      label: t("patients.name"),
      render: (patient: Patient) => (
        <div className="flex items-center gap-3">
          {patient.image && (
            <img
              src={patient.image}
              alt={patient.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          )}
          <span>{patient.name || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: t("patients.email"),
    },
    {
      key: "phone",
      label: t("patients.phone"),
    },
    {
      key: "balance",
      label: t("patients.balance"),
      render: (patient: Patient) => {
        const balance = patient.wallet?.balance ? parseFloat(patient.wallet.balance) : 0;
        return (
          <span className="font-medium">
            ${balance.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "status",
      label: t("patients.status"),
      render: (patient: Patient) => (
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            patient.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {patient.status === "active" ? t("common.active") : patient.status === "inactive" ? t("common.inactive") : patient.status || "N/A"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">{t("patients.title")}</h1>
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
        data={patients}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        isLoading={loading}
        getItemId={(item) => item.id}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedImage(null);
          setImagePreview(null);
        }}
        title={t("patients.editPatient")}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("patients.name")}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={editingPatient?.name || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("patients.phone")}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={editingPatient?.phone || ""}
            />
          </div>
          {/* Professional Image Upload Section */}
          <div className="flex flex-col items-center space-y-4 border-t pt-4">
            <div className="relative">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-lg ring-2 ring-primary/20">
                {(imagePreview || editingPatient?.image) ? (
                  <img
                    src={imagePreview || (editingPatient?.image?.startsWith('http') ? editingPatient.image : `https://galasaty.teamqeematech.site/storage/${editingPatient?.image}`)}
                    alt={editingPatient?.name || t("patients.name")}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=' + (editingPatient?.name?.charAt(0) || 'P')
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 text-4xl font-semibold text-primary">
                    {editingPatient?.name?.charAt(0)?.toUpperCase() || 'P'}
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
                    {(imagePreview || editingPatient?.image) ? t("profile.changeImage") : t("profile.uploadImage")}
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
