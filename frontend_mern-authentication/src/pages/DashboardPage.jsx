import { useState, useEffect } from 'react';
import userService from '../services/user.service.js';
import { toast } from "react-toastify";

function DashboardPage() {
  const [content, setContent] = useState("");

  async function fetchAdmin() {
    setContent("");
    try {
      const data = await userService.fetchAdminData();
      
      setContent(data.message);
      
    } catch (error) {
      toast.error(error.response.data.message);

    }
  }

  useEffect(() => {
    fetchAdmin();
  }, []);
  
  return <>
    {
      content && <div>{content}</div>
    }
  </>
}

export default DashboardPage