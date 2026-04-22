import apiClient from "./api.service";
import "./api.interceptor"

const baseUrl = "/users";

class AuthService {
    async login({email, password}) {
      try {
        const response = await apiClient.post(
          `${baseUrl}/login`, 
          {
          email,
          password
        });
        return response.data;
      } catch (error) {
        throw error.response?.data?.message || "An error occurred while logging in.";
      }
    }

    async verifyLoginOtp({otp, email}) {
      try {
        const response = await apiClient.post(
          `${baseUrl}/verify-login-otp`, {
            email,
            otp
          }, 
          {
            withCredentials: true
          });
        return response.data;
      } catch (error) {
        throw error.response?.data.message || "OTP verification failed";
      }
    }

    async register({name, email, password}) {
      try {
        const response = await apiClient.post(
          `${baseUrl}/`, {
            name,
            email,
            password
          });
        return response.data;
      } catch (error) {
        throw error.response?.data?.message || "Registration failed.";
      }
    }

    async verifyEmail(token) {
      try {
        const response = await apiClient.get(
          `${baseUrl}/verify-email/${token}`
        );
        return response.data;
      } catch (error) {
        throw error.response?.data || "Email verification failed";
      }
    }

    async refreshToken(){
      const response = await apiClient.post(
        `${baseUrl}/refresh-token`, 
        {},
        {
          withCredentials: true
        }
      )
      return response.data;
    }

    async refreshCsrfToken(){
      const response = await apiClient.post(
        `${baseUrl}/refresh-csrf`, 
        {},
        {
          withCredentials: true
        }
      )
      return response.data;
    }

    async logoutUser() {
      try {
        const response = await apiClient.post(`${baseUrl}/logout`);
        return response.data;
      } catch (error) {
        throw error.response?.data || "Logout failed.";
      }
    }
}

export default new AuthService();