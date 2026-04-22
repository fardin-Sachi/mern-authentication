import { Link, useNavigate } from "react-router-dom";
import { AppData } from "../contexts/AppContext";

function HomePage() {
    const {logoutUser, user} = AppData();
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

        {
          user && user.role === "admin" && (
            <Link to="/dashboard"
              className="bg-purple-500 text-white p-2 rounded-md"
            >
          Dashboard
        </Link>
          )
        }
      </div>
      
    </>
  );
}

export default HomePage;
