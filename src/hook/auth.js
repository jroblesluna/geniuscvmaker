import { createContext, useContext, useState } from "react";
import AuthService from "../service/AuthService";

const authContext = createContext();

export default function useAuth() {
	return useContext(authContext);
}

export function AuthProvider(props) {
	const [userCred, setUserCred] = useState(null);
	const [user, setUser] = useState(null);
	const [loginError, setLoginError] = useState("");

	const loginWithGoogle = async () => {
		const { error, userCred } = await AuthService.loginWithGoogle();
		if (userCred){
			setUserCred(userCred);
			setUser(userCred.user);
		}
		setLoginError(error ?? "");
	};

	const logout = async () => {
		await AuthService.logout();
		setUser(null);
	};

	const value = { userCred, user, loginError, loginWithGoogle, logout, setUser };

	return <authContext.Provider value={value} {...props} />;
}
