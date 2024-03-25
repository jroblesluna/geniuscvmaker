import { useRouter } from "next/router";
import React from "react";
import useAuth from "./auth";
import GeniusNavbar from '../components/GeniusNavbar'
import { Toaster } from "react-hot-toast";

export function withPublic(Component) {
	return function WithPublic(props) {
		const auth = useAuth();

		return <Component auth={auth} protected={false} {...props} />;
	};
}

export function withProtected(Component) {
	return function WithProtected(props) {
		const auth = useAuth();
		const router = useRouter();
		if (!auth.user) {
			const currentPath = router.pathname;
			router.push(`/login?ref=${currentPath}`);
		}
		else {
			return (
				<>
					<GeniusNavbar auth={auth} />
					<Toaster position="bottom-right" toastOptions={{ duration: 5000 }} />
					<Component auth={auth} protected={true} {...props} />
				</>
			);
		}
	};
}
