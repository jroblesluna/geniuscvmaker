import { useRouter } from "next/router";
import React from "react";
import useAuth from "./auth";
import GeniusNavbar from '../components/GeniusNavbar'
import { Toaster } from "react-hot-toast";

export function withPublic(Component) {
	return function WithPublic(props) {
		const auth = useAuth();
		return (
			<>
				<Toaster position="top-center" toastOptions={
					{
						duration: 5000,
						style: {
							border: '1px solid #000000',
						},

					}
				} />
				<Component auth={auth} protected={false} {...props} />
			</>);
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
					<Toaster position="top-center" toastOptions={
						{
							duration: 5000,
							style: {
								border: '1px solid #000000',
								marginTop: '50px',
								marginBottom: '-50px',
							},

						}
					} />
					<Component auth={auth} protected={true} {...props} />
				</>
			);
		}
	};
}
