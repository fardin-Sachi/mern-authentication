import { useNavigate } from "react-router-dom";
import { AppData } from "../contexts/AppContext";

function HomePage() {
    const {logoutUser} = AppData();
    const navigate = useNavigate();

  return (
    <>
      <div>HomePage</div>
      <div className="flex w-25 m-auto mt-40">
        <button 
          onClick={() => logoutUser(navigate)}
          className="bg-red-500 text-white p-2 rounded-md"
          >
          Logout
        </button>
      </div>
      
    </>
  );
}

export default HomePage;
