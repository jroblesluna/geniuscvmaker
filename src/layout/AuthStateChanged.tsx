import React, { useEffect, useState } from "react";
import useAuth from "../hook/auth";
import AuthService from "../service/AuthService";
import LoadingScreen from "../components/loadingScreen";

export default function AuthStateChanged({ children }) {
	const { setUser } = useAuth();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		AuthService.waitForUser((userCred) => {
			setUser(userCred);
			setLoading(false);
		});
		//eslint-disable-next-line
	}, []);

	if (loading) {
		return (
			<LoadingScreen />
		);
	}

	return children;
}