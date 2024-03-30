import { createContext, useContext, useState } from "react";
import AuthService from "../service/AuthService";

const authContext = createContext();

export default function useAuth() {
	return useContext(authContext);
}

export function AuthProvider(props) {
	const [userCred, setUserCred] = useState(null);
	const [user, setUser] = useState(null);
	const [error, setError] = useState("");
	const [profileCreated, setProfileCreated] = useState(false);

	const loginWithGoogle = async () => {
		const { error, userCred } = await AuthService.loginWithGoogle();
		if (userCred){
			setUserCred(userCred);
			setUser(userCred.user);
		}
		setError(error ?? "");
	};

	const logout = async () => {
		await AuthService.logout();
		setUser(null);
	};

	const value = { userCred, user, error, profileCreated, loginWithGoogle, logout, setUser, setProfileCreated };

	return <authContext.Provider value={value} {...props} />;
}
