declare const api: import("axios").AxiosInstance;
export declare const authAPI: {
    login: (email: string, password: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    register: (data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    sendVerificationCode: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    verifyCode: (code: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    logout: () => Promise<void>;
    getProfile: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getCities: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    forgotPassword: (email: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    resetPassword: (data: {
        otp: string;
        remember_token: string;
        password: string;
        re_password: string;
    }) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    deleteAccount: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    updateTokens: (playerId: string, fcmToken: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const patientsAPI: {
    getAll: (params?: {
        search?: string;
        status?: string;
    }) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: number, data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    toggle: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const adminsAPI: {
    getAll: (params?: {
        search?: string;
        status?: string;
    }) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getPermissions: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: number, data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    toggle: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const categoriesAPI: {
    getAll: (params?: {
        search?: string;
    }) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getOne: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: number, data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const servicesAPI: {
    getAll: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getOne: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: number, data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const specialsAPI: {
    getAll: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getOne: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: number, data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const citiesAPI: {
    getAll: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getOne: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: number, data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const settingsAPI: {
    getSettings: (params?: {
        type?: string;
        status?: string;
    }) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    updateSettings: (data: {
        minimum_fare_to_book?: string;
        profit_type?: string;
        profit_value?: string;
    }) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const bannersAPI: {
    getAll: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getOne: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: number, data: FormData) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const transactionsAPI: {
    getAll: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getOne: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    markAsPaid: (id: number, image?: File) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export default api;
