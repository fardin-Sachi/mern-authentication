import apiClient from "./api.service";
import "./api.interceptor";

const baseUrl = "/users";

class UserService {
    async fetchUser() {
      try {
        const response = await apiClient.get(`${baseUrl}/me`);
        return response.data;
      } catch (error) {
        throw error.response?.data?.message || "User not found";
      }
    }

    async logoutUser() {
      try {   
        const response = await apiClient.post(
          `${baseUrl}/logout`
        )

        return response.data;
      } catch (error) {
        throw error.response?.data?.message || "User not found";
      }
    }
}

export default new UserService();