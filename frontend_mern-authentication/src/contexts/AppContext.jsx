import { createContext, useContext, useEffect, useState } from "react";
import userService from "../services/user.service";
import { toast } from "react-toastify";
import { LOCAL_STORAGE } from "../constants/localStorage.constant";

const AppContext = createContext(null)

export const AppProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    /* If a user proceed to OTP verification page while
     *  loggin in, his email is stored in the localStorage.
     *  If localStorage does not have an email stored, user
     *  should not be able to go to the OTP verification 
     *  page
    */
    const userEmail = localStorage.getItem(`${LOCAL_STORAGE.baseName}:email`) || "";

    async function fetchUser() {
        
        setLoading(true);
        try {
            const data = await userService.fetchUser();
            setUser(data);
            setIsAuth(true);
        } catch (error) {
            console.error(error);
            setUser(null);
            setIsAuth(false);
        } finally {
            setLoading(false);
        }
    }
    
    async function logoutUser() {
        if(!isAuth || !user) return;
        try {
            const data = await userService.logoutUser();
            toast.success(data.message);
            setIsAuth(false);
            setUser(null);

            //In case there is email data
            localStorage.removeItem(`${LOCAL_STORAGE.baseName}:email`);
        } catch (error) {
            toast.error(error?.message || "Logout failed");
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AppContext.Provider 
            value={{ setIsAuth, isAuth, setUser, user, loading, logoutUser, userEmail }}
            >
            {children}
        </AppContext.Provider>
    )

}

export const AppData = () => {
    const context = useContext(AppContext);

    if(!context) {
        throw new Error("AppData must be used within an AppProvider");
    }

    return context;
}