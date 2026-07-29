import axios from "axios";

// Base API URL
const API_BASE_URL = "https://galasaty.teamqeematech.site/api";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  withCredentials: false,
});

/* =====================
    REQUEST INTERCEPTOR
===================== */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add Accept-Language header based on current language preference
  const language = localStorage.getItem("i18nextLng") || "en";
  config.headers["Accept-Language"] = language;

  return config;
});

/* ======================
    RESPONSE INTERCEPTOR
====================== */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "";
      
      // Check if this is a business logic error (not a real auth error)
      // Business logic errors usually have specific messages about the operation
      const isBusinessLogicError = 
        errorMessage.toLowerCase().includes("wallet") ||
        errorMessage.toLowerCase().includes("balance") ||
        errorMessage.toLowerCase().includes("money") ||
        errorMessage.toLowerCase().includes("cannot delete") ||
        errorMessage.toLowerCase().includes("has transactions") ||
        errorMessage.toLowerCase().includes("has orders") ||
        errorMessage.toLowerCase().includes("validation") ||
        errorMessage.toLowerCase().includes("not allowed");
      
      // Log error details
      console.error("401 Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage,
        isBusinessLogicError,
      });
      
      // If it's a business logic error, don't redirect - just reject the promise
      // so the component can handle it and show the error to the user
      if (isBusinessLogicError) {
        console.log("Business logic error detected - not redirecting to login");
        return Promise.reject(error);
      }
      
      // Only redirect if it's a real authentication error
      localStorage.removeItem("token");
      
      // Small delay to allow alert to be seen
      setTimeout(() => {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }, 100);
    }
    return Promise.reject(error);
  }
);

/* ===================
        AUTH API
=================== */
export const authAPI = {
  login: async (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append("email", email);
    form.append("password", password);

    const res = await api.post("/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    localStorage.setItem("token", res.data.access_token);
    return res;
  },

  register: (data: FormData) =>
    api.post("/register", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  sendVerificationCode: () => api.post("/send-verification-code"),

  verifyCode: (code: string) => {
    const form = new URLSearchParams();
    form.append("code", code);
    return api.post("/verify-code", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  logout: async () => {
    await api.post("/logout");
    localStorage.removeItem("token");
  },

  getProfile: () => api.get("/user"),

  getCities: () => api.get("/cities"),

  forgotPassword: (email: string) => {
    const form = new URLSearchParams();
    form.append("email", email);
    return api.post("/forgot-password", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  resetPassword: (data: {
    otp: string;
    remember_token: string;
    password: string;
    re_password: string;
  }) => {
    const form = new URLSearchParams();
    form.append("otp", data.otp);
    form.append("remember_token", data.remember_token);
    form.append("password", data.password);
    form.append("re_password", data.re_password);
    return api.post("/reset-password", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  update: (data: FormData) => {
    data.append("_method", "PUT");
    return api.post("/update", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteAccount: () => api.delete("/delete-account"),

  updateTokens: (playerId: string, fcmToken: string) => {
    const form = new URLSearchParams();
    form.append("player_id", playerId);
    form.append("fcm_token", fcmToken);
    form.append("_method", "PUT");
    return api.post("/update-tokens", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },
};

/* =========================
        REST COLLECTIONS
========================== */

export const patientsAPI = {
  // READ
  getAll: (params?: { search?: string; status?: string }) =>
    api.get("/all-patients", { params }),

  // UPDATE ✅ METHOD SPOOFING
  update: (id: number, data: FormData) => {
    data.append("_method", "PUT");
    return api.post(`/update-patient/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // TOGGLE (uses true PUT so ok)
  toggle: (id: number) =>
    api.put(`/toggle-patient/${id}`),

  // DELETE - Try actual DELETE method first (as per Postman), fallback to POST spoofing
  delete: async (id: number) => {
    try {
      // Try actual DELETE method first (as shown in Postman collection)
      return await api.delete(`/delete-patient/${id}`);
    } catch (error: any) {
      // If DELETE method not allowed (405) or other method error, use POST with spoofing
      if (error.response?.status === 405 || error.response?.status === 404) {
        const form = new FormData();
        form.append("_method", "DELETE");
        return await api.post(`/delete-patient/${id}`, form);
      }
      // Re-throw other errors (like 401) so they can be handled properly
      throw error;
    }
  },
};

export const adminsAPI = {
  getAll: (params?: { search?: string; status?: string }) =>
    api.get("/all-admins", { params }),
  getPermissions: () => api.get("/all-permissions"),

  create: (data: FormData) =>
    api.post("/create-admin", data),

  update: (id: number, data: FormData) => {
    data.append("_method", "PUT")
    return api.post(`/update-admin/${id}`, data)
  },

  toggle: (id: number) =>
    api.put(`/toggle-admin/${id}`),

  delete: (id: number) => {
    const form = new FormData()
    form.append("_method", "DELETE")
    return api.post(`/delete-admin/${id}`, form)
  },
};


export const categoriesAPI = {
  getAll: (params?: { search?: string }) =>
    api.get("/all-categories", { params }),

  getOne: (id: number) =>
    api.get(`/single-category/${id}`),


  create: (data: FormData) =>
    api.post("/create-category", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }),


  update: (id: number, data: FormData) => {
    data.append("_method", "PUT");
    return api.post(`/update-category/${id}`, data);
  },

  delete: (id: number) => {
    const form = new FormData();
    form.append("_method", "DELETE");
    return api.post(`/delete-category/${id}`, form);
  },
};


export const servicesAPI = {
  getAll: () => api.get("/all-services"),

  getOne: (id: number) =>
    api.get(`/single-service/${id}`),

  create: (data: FormData) =>
    api.post("/create-service", data),

  update: (id: number, data: FormData) => {
    data.append("_method", "PUT");
    return api.post(`/update-service/${id}`, data);
  },

  delete: (id: number) => {
    const form = new FormData();
    form.append("_method", "DELETE");
    return api.post(`/delete-service/${id}`, form);
  },
};

export const specialsAPI = {
  getAll: () => api.get("/all-specials"),

  getOne: (id: number) =>
    api.get(`/single-special/${id}`, {
      headers: { "Accept-Language": "en" },
    }),

  create: (data: FormData) =>
    api.post("/create-special", data),

  update: (id: number, data: FormData) => {
    data.append("_method", "PUT");
    return api.post(`/update-special/${id}`, data);
  },

  delete: (id: number) => {
    const form = new FormData();
    form.append("_method", "DELETE");
    return api.post(`/delete-special/${id}`, form);
  },
};

/* =========================
    MOBILE SPECIALS API
========================== */
// export const mobileSpecialsAPI = {
//   getAll: (params?: { search?: string; lang?: string }) =>
//     api.get("/doctor/specials", {
//       params: params?.search ? { search: params.search } : {},
//       headers: params?.lang ? { "Accept-Language": params.lang } : {},
//     }),
// };

export const citiesAPI = {
  getAll: () => api.get("/all-cities"),

  getOne: (id: number) =>
    api.get(`/single-city/${id}`, {
      headers: { "Accept-Language": "en" },
    }),

  create: (data: FormData) =>
    api.post("/create-city", data),

  update: (id: number, data: FormData) => {
    data.append("_method", "PUT");
    return api.post(`/update-city/${id}`, data);
  },

  delete: (id: number) => {
    const form = new FormData();
    form.append("_method", "DELETE");
    return api.post(`/delete-city/${id}`, form);
  },
};

export const settingsAPI = {
  getSettings: (params?: { type?: string; status?: string }) =>
    api.get("/get-settings", { params }),

  updateSettings: (data: {
    minimum_fare_to_book?: string;
    profit_type?: string;
    profit_value?: string;
  }) => {
    const form = new URLSearchParams();

    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) form.append(k, v);
    });

    form.append("_method", "PUT");

    return api.post("/update-settings", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },
  
};

// I add it after I get the new collection
export const bannersAPI = {
  getAll: () => api.get("/all-banners"),

  getOne: (id: number) =>
    api.get(`/single-banner/${id}`, {
      headers: { "Accept-Language": "en" },
    }),

  create: (data: FormData) =>
    api.post("/create-banner", data),

  update: (id: number, data: FormData) => {
    data.append("_method", "PUT");
    return api.post(`/update-banner/${id}`, data);
  },

  delete: (id: number) => {
    const form = new FormData();
    form.append("_method", "DELETE");
    return api.post(`/delete-banner/${id}`, form);
  },
};

/* =========================
    MOBILE BANNERS API
========================== */
// export const mobileBannersAPI = {
//   getAll: (params?: { lang?: string }) =>
//     api.get("/banners", {
//       headers: params?.lang ? { "Accept-Language": params.lang } : {},
//     }),
// };

// I add it after I get the new collection
export const transactionsAPI = {
  getAll: () => api.get("/withdraw-requests"),

  getOne: (id: number) =>
    api.get(`/withdraw-request/${id}`, {
      headers: { "Accept-Language": "en" },
    }),

  // from Github
  markAsPaid: (id: number, image?: File) => {
    const formData = new FormData();

    if (image) {
      formData.append("image", image);
    }

    formData.append("_method", "PUT");

    return api.post(
      `/withdraw-request/${id}/mark-as-paid`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  delete: (id: number) => {
    const form = new FormData();
    form.append("_method", "DELETE");
    return api.post(`/withdraw-request/${id}`, form);
  },
};

/* =========================
    MOBILE TRANSACTIONS API
========================== */
// export const mobileTransactionsAPI = {
//   myTransactions: (params?: { type?: string; status?: string }) =>
//     api.get("/my-transactions", { params }),

//   myWithdrawRequests: (params?: { status?: string }) =>
//     api.get("/my-withdraw-requests", { params }),

//   addWithdrawRequest: (amount: string) => {
//     const form = new URLSearchParams();
//     form.append("amount", amount);
//     return api.post("/add-withdraw-request", form, {
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     });
//   },

//   chargeWallet: (amount: string) => {
//     const form = new URLSearchParams();
//     form.append("amount", amount);
//     return api.post("/charge-my-wallet", form, {
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     });
//   },
// };


/* =========================
    MOBILE DOCTOR API
========================== */
// export const mobileDoctorAPI = {
//   mySpecials: (params?: { lang?: string }) =>
//     api.get("/doctor/my-specials", {
//       headers: params?.lang ? { "Accept-Language": params.lang } : {},
//     }),

//   updateSpecials: (specialIds: number[]) => {
//     const form = new URLSearchParams();
//     specialIds.forEach((id) => {
//       form.append("special_ids[]", id.toString());
//     });
//     form.append("_method", "PUT");
//     return api.post("/doctor/update-specials", form, {
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     });
//   },

//   myServices: (params?: { lang?: string }) =>
//     api.get("/doctor/my-services", {
//       headers: params?.lang ? { "Accept-Language": params.lang } : {},
//     }),

//   updateServices: (services: Array<{
//     service_id: number;
//     price: string;
//     type: "indoor" | "outdoor";
//   }>) => {
//     const form = new URLSearchParams();
//     services.forEach((service, index) => {
//       form.append(`services[${index}][service_id]`, service.service_id.toString());
//       form.append(`services[${index}][price]`, service.price);
//       form.append(`services[${index}][type]`, service.type);
//     });
//     form.append("_method", "PUT");
//     return api.post("/doctor/update-services", form, {
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     });
//   },

//   deleteService: (serviceId: number, type: "indoor" | "outdoor") => {
//     const form = new URLSearchParams();
//     form.append("type", type);
//     form.append("_method", "DELETE");
//     return api.post(`/doctor/services/${serviceId}`, form, {
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     });
//   },
// };

export default api;
