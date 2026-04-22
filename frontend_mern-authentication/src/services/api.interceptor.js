import apiClient from "./api.service";
import authService from "./auth.service";

const getCookie = (name) => {
    const value = `; ${document.cookie}`;

    const parts = value.split(`; ${name}=`);
    if(parts.length === 2){
        return parts.pop().split(`;`).shift();
    }
}

apiClient.interceptors.request.use(
    (config) => {
        const method = config.method?.toLowerCase();
        if(["post", "put", "delete", "patch"].includes(method)){
            const csrfToken = getCookie("csrfToken");
            if(csrfToken){
                config.headers["x-csrf-token"] = csrfToken;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

let isRefreshing = false;
let isRefreshingCsrf = false;
let failedQueue = [];
let csrfFailedQueue = [];

const processQueue = (error, token=null) => {
    failedQueue.forEach((prom) => {
        if(error){
            prom.reject(error);
        }
        else {
            prom.resolve(token);
        }
    })

    failedQueue = [];
}

const processCsrfQueue = (error, token=null) => {
    csrfFailedQueue.forEach((prom) => {
        if(error){
            prom.reject(error);
        }
        else {
            prom.resolve(token);
        }
    })

    csrfFailedQueue = [];
}

apiClient.interceptors.response.use(
    (response) => response, 
    
    async (error)=> {
        const originalRequest = error.config;

        if(
            error.response?.status === 403 && 
            !originalRequest._retry 
            // && 
            // !originalRequest.url.includes("/refresh-token")
        ){
            const errorCode = error.response.data?.code || "";
            if(errorCode.startsWith("CSRF_")){
                if(isRefreshingCsrf){
                    return new Promise((resolve, reject) => {
                        csrfFailedQueue.push({resolve, reject});
                    })
                        .then(() => apiClient(originalRequest));
                }

                originalRequest._retry = true;
                isRefreshingCsrf = true;

                try {
                    await authService.refreshCsrfToken();
                    processCsrfQueue(null);
                    return apiClient(originalRequest);
                } catch (error) {
                    processCsrfQueue(error);
                    console.error(`Failed to refresh CSRF token: ${error}`);
                    return Promise.reject(error);
                } finally {
                    isRefreshingCsrf = false;
                }
            }

            if(isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({resolve, reject});
                }).then(() => {
                    return apiClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await authService.refreshToken();
                processQueue(null);
                return apiClient(originalRequest);
            } catch (error) {
                processQueue(error, null);

                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;