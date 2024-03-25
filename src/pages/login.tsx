import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { withPublic } from "../hook/route";

function Login({ auth }) {
	const { user, loginWithGoogle, error } = auth;
	const router = useRouter();
	const ref = router.query.ref as string || '/apps';

	useEffect(() => {
		if (user) {
			router.push(ref);
		}
	}, [user, router]);

	return (
		<div>
			<div>Current Path: {router.pathname}</div>
			<div>Ref: {ref}</div>
			{error && <h1>{error}</h1>}
			<button onClick={loginWithGoogle}>Google</button>
			<h1>{user?.uid}</h1>
		</div>
	);
}

export default withPublic(Login);
