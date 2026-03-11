import apiClient from "./api.service";

const baseUrl = "/users";

class UserService {
    async fetchUser() {
      try {
        const response = await apiClient.get(
            `${baseUrl}/me`, 
        {
            withCredentials: true
        });
        return response.data;
      } catch (error) {
        throw error.response?.data?.message || "User not found";
      }
    }
}

export default new UserService();