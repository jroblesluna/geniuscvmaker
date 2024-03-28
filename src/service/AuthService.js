import { getApp } from "firebase/app";
import {
	getAuth,
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
	onAuthStateChanged
} from "firebase/auth";

class AuthService {
	constructor(firebaseApp) {
		this.auth = getAuth(firebaseApp);
	}

	waitForUser(callback) {
		return onAuthStateChanged(this.auth, (userCred) => {
			callback(userCred);
		});
	}

	async loginWithGoogle() {
		try {
			const userCred = await signInWithPopup(this.auth, new GoogleAuthProvider());
			return { userCred: userCred };
		} catch (error) {
			return { error: error.message };
		}
	}

	async logout() {
		await signOut(this.auth);
	}
}

export default new AuthService(getApp());
