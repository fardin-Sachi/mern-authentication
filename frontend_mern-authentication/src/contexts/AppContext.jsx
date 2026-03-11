import { Children, createContext, useContext, useEffect, useState } from "react";
import userService from "../services/user.service";

const AppContext = createContext(null)

export const AppProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    async function fetchUser() {
        setLoading(true);
        try {
            const data = userService.fetchUser();
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

    useEffect(() => {
        fetchUser();
    }, []);

    return <AppContext.Provider value={{ setIsAuth, isAuth, setUser, user, loading }}>
        {children}
    </AppContext.Provider>

}

export const AppData = () => {
    const context = useContext(AppContext);

    if(!context) {
        throw new Error("AppData must be used within an AppProvider");
    }

    return context;
}