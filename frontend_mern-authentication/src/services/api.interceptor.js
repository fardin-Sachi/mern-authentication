import { AppData } from "../contexts/AppContext";
import apiClient from "./api.service";
import authService from "./auth.service";

let isRefreshing = false;
let failedQueue = [];

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

apiClient.interceptors.response.use(
    (response) => response, 
    
    async (error)=> {
        const originalRequest = error.config;

        if(error.response?.status === 403 && !originalRequest._retry && !originalRequest.url.includes("/refresh-token")){
            const { isAuth } = AppData();

            /// If user is not logged in, do not attempt refresh
            if (!isAuth) return Promise.reject(error);

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