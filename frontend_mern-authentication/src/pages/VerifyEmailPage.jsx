import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import authService from "../services/auth.service";
import LoaderComponent from "../components/LoaderComponent";

function VerifyEmailPage() {
  const [message, setMessage] = useState({
    forSuccess: "",
    forError: "",
  });
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();

  const params = useParams();

  async function verifyUser() {
    setLoading(true);
    try {
      const data = await authService.verifyEmail(params.token);
      if(data.success){
        setMessage({
          forSuccess: data.message,
          forError: ""
        });
      } else {
        setMessage({
          forSuccess: "",
          forError: data.message
        });
      }
      
    } catch (error) {
      setMessage({
        forSuccess: "",
        forError: error.message || "Something went wrong"
      });

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    verifyUser();
  }, []);

  return (
    <>
      {loading ? (
        <LoaderComponent />
      ) : (
        <div className="w-50 m-auto mt-12">
          {message.forSuccess && 
            <p className="text-green-500 text-2xl">{message.forSuccess}</p>
          }
          {message.forError && 
            <p className="text-red-500 text-2xl">{message.forError}</p>
          }
        </div>
      )}
    </>
  );
}

export default VerifyEmailPage;
