import axios from "axios";
import server from "../config/env.config.js"

const apiClient = axios.create({
    baseURL: server,
    // timeout: 1000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
})

export default apiClient;