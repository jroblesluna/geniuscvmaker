import React, { useEffect, useState} from "react";
import { useRouter } from "next/router";
import { UserCredential, getAdditionalUserInfo } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, updateDoc, DocumentReference, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from "react-hot-toast";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { useCompletion } from 'ai/react';
import { withPublic } from "../hook/route";
import SvgLoading from "../components/svgLoading";
import SvgLogo from "../components/svgLogo";
import { tosContent, tosTitle } from "../components/tos";

function Login({ auth }) {
	const { userCred, user, loginWithGoogle, loginError } = auth;
	const router = useRouter();
	const refUrl = router.query.ref as string || '/apps';
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	//const [scrollBehavior, setScrollBehavior] = React.useState("inside");
	const { isLoading, completion, complete, error, data } = useCompletion();
	const prompt = "Generate a succinct summary similar to the following: 'I'm a driven and flexible professional with a diverse background across multiple industries. I have outstanding communication, leadership, and problem-solving skills, and a proven history of achievements. I'm confident to excel in high-pressure environments and I'm dedicated to continuous learning and growth for success in varied roles.'";
	const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
	const [aiInvoked, setAiInvoked] = useState(false);
	const [canGo, setCanGo] = useState(false);
	const [isWorking, setIsWorking] = useState(false);
	const [creationCheckRequested, setCreationCheckRequested] = useState(false);
	const [userDocRef, setUserDocRef] = useState<DocumentReference | null>(null);
	const [needsDelay, setNeedsDelay] = useState(false);

	function goHome() { router.push('/') }

	async function updateAbout() {
		if (userDocRef) {
			await updateDoc(userDocRef, { about: completion });
			setNeedsDelay(true);
		}
	}


	async function listCulqiCustomerByEmail(email: string) {
		try {
			console.log("email", email);
			const response = await fetch('/api/culqi', {
				method: 'POST',//Don't get confused, this is always POST
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					culqiMethod: 'list.customers',
					culqiBody: {
						"email": email
					}
				}),
			});
			const data = await response.json();
			console.log('Customer data:', data);
			return (data);
		} catch (error) {
			console.error('Error listing customer:', error);
			return null;
		}
	}

	async function createCulqiUser(email: string, address: string, address_city: string, country_code: string, first_name: string, last_name: string, phone_number: string) {

		try {
			const response = await fetch('/api/culqi', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					culqiMethod: 'create.customers',
					culqiBody: {
						"first_name": first_name,
						"last_name": last_name,
						"email": email,
						"address": address,
						"address_city": address_city,
						"country_code": country_code,
						"phone_number": phone_number
					}
				}),
			});
			const data = await response.json();
			console.log('Customer created:', data);
			return (data);
		} catch (error) {
			console.error('Error creating customer:', error);
			return null;
		}

	}

	async function checkAndCreateUserInFirestore(userCred: UserCredential) {
		if (user && userCred === null) {
			setCanGo(true);
			toast.success("Already Logged In!");
		}
		else {
			if (userCred) {
				const userFromUserCred = userCred.user;
				const firestore = getFirestore();
				const storage = getStorage();
				if (userFromUserCred) {
					const additionalUserInfo = await getAdditionalUserInfo(userCred);
					if (additionalUserInfo !== null) {
						const { profile } = additionalUserInfo;
						const userCollectionRef = collection(firestore, "users");
						const userRef = doc(userCollectionRef, userFromUserCred.uid);
						setUserDocRef(userRef);
						const userSnapshot = await getDoc(userRef);
						if (!userSnapshot.exists() && profile) {
							try {
								let photoDownloadURL = "";
								let uploadPath = `profilePictures/${userFromUserCred.uid}`;
								let newAddress = "123 Main Street";
								let newAddressCity = "Home Town";
								let newAddressState = "California";
								let newAddressCountry = "United States";
								let newAddressCountryCode = "US";
								let newPhoneNumber = "10000000000";
								if (userFromUserCred.photoURL) {
									const photoFetch = await fetch(userFromUserCred.photoURL);
									const photoBlob = await photoFetch.blob();
									const storageRef = ref(storage, uploadPath);
									const uploadResult = await uploadBytes(storageRef, photoBlob);
									photoDownloadURL = await getDownloadURL(uploadResult.ref);
								}
								console.log("Creando Culqi Customer");
								let culqiCustomer = await createCulqiUser(userFromUserCred.email as string, newAddress, newAddressCity, newAddressCountryCode, profile.given_name as string, profile.family_name as string, newPhoneNumber);

								if (culqiCustomer.object === 'error' && culqiCustomer.param === 'email')
									try {
										culqiCustomer = (await listCulqiCustomerByEmail(userFromUserCred.email as string)).data[0];
									}
									catch (error) {
										toast.error("Error consultando cliente existente.");
									}

								console.log("Customer ID", culqiCustomer.id);
								await setDoc(userRef, {
									email: userFromUserCred.email,
									displayName: userFromUserCred.displayName,
									lastName: profile.family_name,
									firstName: profile.given_name,
									photoURL: photoDownloadURL,
									telephoneNumber: `+${newPhoneNumber}`,
									addressStreet: newAddress,
									addressCity: newAddressCity,
									addressZipCode: "00000",
									addressState: newAddressState,
									addressCountry: newAddressCountry,
									addressCountryCode: newAddressCountryCode,
									about: "",
									favoriteCard: "",
									createdAt: serverTimestamp(),
									culqiCustomerId: culqiCustomer?.id || "",
								});
								console.log("Usuario Creado");
								setIsNewUser(true);
								toast.success('A sample professional review was AI created for you! Update your profile!');
							} catch (error) {
								return { error: error.message };
							}
						}
						else {
							console.log("Usuario Ya Existe");
							setIsNewUser(false);
							setCanGo(true);
							toast.success("Welcome back!");
						}
					} else {
						console.error("Additional User Info is Missing");
					}
				}
				else {
					console.log("No Hay user");
				}
			}
		}
	}

	useEffect(() => {
		if (user && !creationCheckRequested) {
			checkAndCreateUserInFirestore(userCred);
			setCreationCheckRequested(true);
		}

		if (isNewUser === true && !isLoading && !canGo) {
			if (!aiInvoked) {
				complete(prompt);
				setAiInvoked(true);
			} else {
				updateAbout();
			}
		}

	}, [user, isNewUser, isLoading]);

	useEffect(() => {
		let timerId: string | number | NodeJS.Timeout | undefined;
		if (needsDelay) {
			console.log("Delaying...");
			timerId = setTimeout(() => {
				console.log("Time's up!");
				setCanGo(true);
			}, 3000);
		}
		return () => {
			clearTimeout(timerId);
		};
	}, [needsDelay]);

	useEffect(() => {
		if (canGo) {
			console.log("ROUTING...");
			router.push(isNewUser ? "/profile" : refUrl);
		}
	}, [canGo])

	useEffect(() => {
		if (isWorking && loginError != "") {
			setIsWorking(false);
		}
	}, [isWorking, loginError]);

	function handleLogin() {
		setIsWorking(true);
		onClose();
		loginWithGoogle();
	}

	return (
		<>
			<div className="relative bg-genius-orange h-screen flex justify-center items-center">
				<div className="w-4/5 grid grid-cols-1 items-center justify-center">
					<div className="m-2 grid justify-center items-center">
						<div className="white-text text-6xl text-center">genius</div>
						<div className="mb-2 topic-title-white text-2xl text-center">CV MAKER</div>
						<div className="m-2 flex justify-center items-center">
							<Button color="primary" variant="bordered" isLoading={isWorking} onClick={onOpen} className="p-4 w-fit rounded-xl text-lg bg-gray-200">
								Sign in with Google
							</Button>
						</div>
						<div onClick={goHome} className="m-2 flex justify-center items-center topic-text-white cursor-pointer">
							← Go back to Home
						</div>
						<div>
							{data && (
								<div className="w-full p-4 text-sm bg-gray-100 rounded-xl opacity-80">
									<p className="mb-2 font-bold">Your AI description (change in Profile):</p>
									<p className="mb-2">{completion}</p>
									{error && (
										<div className="fixed top-0 left-0 w-full p-4 text-center bg-red-500 text-white">
											{error.message}
										</div>
									)}
								</div>
							)}
							{(isWorking && loginError == "") ? (<div className="flex justify-center items-center relative">
								<div className="absolute z-20 w-5">
									<SvgLogo fillColor="#FFFFFF" />
								</div>
								<div className="z-10 w-24">
									<SvgLoading fillColor="#FFFFFF" />
								</div>
							</div>) : (
								<>
									{(loginError != "") && (
										<div className="fixed top-0 left-0 w-full p-4 text-center bg-red-500 text-white">
											{loginError}
										</div>
									)}
								</>
							)}

						</div>
					</div>
				</div>
			</div>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				backdrop="blur"
				scrollBehavior="inside">
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								{tosTitle}
							</ModalHeader>
							<ModalBody className="bg-gray-200 mx-3">
								{tosContent}
							</ModalBody>
							<ModalFooter>
								<Button color="danger" onPress={onClose}>
									Close
								</Button>
								<Button color="success" onPress={handleLogin}>
									I Accept Terms of Service
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}

export default withPublic(Login);