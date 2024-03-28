import React, { useEffect } from "react";
import { useRouter } from "next/router";
import {
	UserCredential,
	getAdditionalUserInfo,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from "react-hot-toast";
import { withPublic } from "../hook/route";

async function checkAndCreateUserInFirestore(userCred: UserCredential) {
	const user = userCred.user;
	const firestore = getFirestore();
	const storage = getStorage();
	console.log(storage);
	if (user) {
		const additionalUserInfo = getAdditionalUserInfo(userCred);
		if (additionalUserInfo !== null) {
			const { profile } = additionalUserInfo;
			const userCollectionRef = collection(firestore, "users");
			const userRef = doc(userCollectionRef, user.uid);
			const userSnapshot = await getDoc(userRef);
			if (!userSnapshot.exists() && profile) {
				let photoDownloadURL = "";
				if (user.photoURL) {
					const photoFetch = await fetch(user.photoURL);
					const photoBlob = await photoFetch.blob();
					const storageRef = ref(storage, `profilePictures/${user.uid}`,);
					const uploadResult = await uploadBytes(storageRef, photoBlob);
					photoDownloadURL = await getDownloadURL(uploadResult.ref);
				}
				await setDoc(userRef, {
					email: user.email,
					displayName: user.displayName,
					family_name: profile.family_name,
					given_name: profile.given_name,
					photoURL: photoDownloadURL,
				});
				toast.success('Your profile was created!');
			}
			else {
				toast.success("Welcome back!");
			}
		} else {
			console.error("Additional User Info is Missing");
		}
	}
}

function Login({ auth }) {
	const { userCred, user, loginWithGoogle, error } = auth;
	const router = useRouter();
	const ref = router.query.ref as string || '/apps';

	useEffect(() => {
		if (user) {
			checkAndCreateUserInFirestore(userCred);
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