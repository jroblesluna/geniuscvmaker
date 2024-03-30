import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { UserCredential, getAdditionalUserInfo } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from "react-hot-toast";
import { withPublic } from "../hook/route";
import Link from 'next/link'
import { Button, Checkbox, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, RadioGroup, Radio, Listbox, ListboxItem } from "@nextui-org/react";

async function checkAndCreateUserInFirestore(userCred: UserCredential) {
	if (userCred) {
		const user = userCred.user;
		console.log(user.uid);
		const firestore = getFirestore();
		const storage = getStorage();
		console.log(storage);
		if (user) {
			const additionalUserInfo = await getAdditionalUserInfo(userCred);
			if (additionalUserInfo !== null) {
				const { profile } = additionalUserInfo;
				const userCollectionRef = collection(firestore, "users");
				const userRef = doc(userCollectionRef, user.uid);
				const userSnapshot = await getDoc(userRef);
				if (!userSnapshot.exists() && profile) {
					let photoDownloadURL = "";
					let uploadPath = `profilePictures/${user.uid}`;
					console.log("uploadPath", uploadPath);
					console.log(user.photoURL);
					if (user.photoURL) {
						const photoFetch = await fetch(user.photoURL);
						const photoBlob = await photoFetch.blob();
						console.log("1. storage", storage);
						console.log("2. uploadPath", uploadPath);
						const storageRef = ref(storage, uploadPath);
						console.log("3. storageRef", storageRef);
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
}

function Login({ auth }) {
	const { userCred, user, loginWithGoogle, error } = auth;
	const router = useRouter();
	const ref = router.query.ref as string || '/apps';
	const [termsAccepted, setTermsAccepted] = useState(false);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [scrollBehavior, setScrollBehavior] = React.useState("inside");

	useEffect(() => {
		if (user) {
			checkAndCreateUserInFirestore(userCred);
			router.push(ref);
		}
	}, [user, router]);

	return (
		<>
			<div className="relative bg-genius-orange h-screen flex justify-center items-center">
				<div className="w-4/5 grid grid-cols-1 items-center justify-center">
					<div className="m-2 grid justify-center items-center">
						<div className="white-text text-6xl text-center">genius</div>
						<div className="mb-2 topic-title-white text-2xl text-center">CV MAKER</div>
						<div className="m-2 flex justify-center items-center">
							<Button onClick={onOpen} className="appButton p-2 w-fit rounded-xl text-lg">
								Sign in with Google
							</Button>
						</div>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<Button onPress={onOpen}>Open Modal</Button>
				<RadioGroup
					label="Select scroll behavior"
					orientation="horizontal"
					value={scrollBehavior}
					onValueChange={setScrollBehavior}
				>
					<Radio value="inside">inside</Radio>
					<Radio value="outside">outside</Radio>
				</RadioGroup>
				<Modal
					isOpen={isOpen}
					onOpenChange={onOpenChange}
					backdrop="blur"
					scrollBehavior="inside"
				>
					<ModalContent>
						{(onClose) => (
							<>
								<ModalHeader className="flex flex-col gap-1">
									Terms Of Service
								</ModalHeader>
								<ModalBody className="bg-gray-200 mx-3">
									<div>These Terms of Service ("Terms") govern your use of the Genius CV Maker website and its services. By accessing or using our website and services, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you may not access or use our website and services.</div>
									<div className="text-md font-bold">1. Description of Services</div>
									<div className="">Genius CV Maker provides AI-powered tools for creating professional resumes and CVs. Our services include but are not limited to:</div>
									<div className="">
										<ul className="list-disc ml-4">
											<li>Scratch: Create your first CV or résumé.</li>
											<li>Craft: Answer questions about your skills and experience for AI-crafted CVs.</li>
											<li>Optimize: Upload your existing CV for AI analysis and professional advice.</li>
											<li>Spotlight: Tailor your CV for specific job or college applications.</li>
										</ul>
									</div>
									<div className="text-md font-bold">2. User Accounts</div>
									<div className="">You may be required to create a user account to access certain features of our website. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</div>
									<div className="text-md font-bold">3. User Responsibilities</div>
									<div className="">By using our services, you agree to:</div>
									<div className="">
										<ul className="list-disc ml-4">
											<li>Provide accurate and up-to-date information.</li>
											<li>Comply with all applicable laws and regulations.</li>
											<li>Respect the intellectual property rights of others.</li>
											<li>Use our services only for lawful purposes.</li>
										</ul>
									</div>
									<div className="text-md font-bold">4. Intellectual Property Rights</div>
									<div className="">You retain ownership of any content you create using our services. By using our services, you grant Genius CV Maker a non-exclusive, royalty-free license to use, reproduce, and modify your content solely for the purpose of providing our services to you.</div>
									<div className="text-md font-bold">5. Privacy Policy</div>
									<div className="">Your use of our website and services is subject to our Privacy Policy, which outlines how we collect, use, and protect your personal information. By using our website and services, you consent to the terms of our Privacy Policy.</div>
									<div className="text-md font-bold">6. Payment Terms (if applicable)</div>
									<div className="">Certain features of our website and services may be offered for a fee. Payment terms will be provided to you at the time of purchase and are subject to our billing and refund policies.</div>
									<div className="text-md font-bold">7. Disclaimer of Warranties</div>
									<div className="">Our services are provided on an "as is" and "as available" basis without any warranties, express or implied. We do not warrant that our services will be error-free, uninterrupted, or secure.</div>
									<div className="text-md font-bold">8. Limitation of Liability</div>
									<div className="">Genius CV Maker shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of our website and services.</div>
									<div className="text-md font-bold">9. Indemnification</div>
									<div className="">You agree to indemnify and hold Genius CV Maker harmless from any claims, damages, liabilities, and expenses arising out of or in connection with your use of our website and services or your violation of these Terms.</div>
									<div className="text-md font-bold">10. Governing Law and Dispute Resolution</div>
									<div className="">These Terms shall be governed by and construed in accordance with the laws of the State of California. Any disputes arising out of or relating to these Terms shall be resolved exclusively by the competent courts of Cupertino, CA.</div>
									<div className="text-md font-bold">11. Changes to the Terms</div>
									<div className="">Genius CV Maker reserves the right to modify or revise these Terms at any time without prior notice. Any changes to these Terms will be effective immediately upon posting on our website. Your continued use of our website and services after the posting of changes constitutes your acceptance of such changes.</div>
									<div className="text-md font-bold">12. Contact Information</div>
									<div className="">If you have any questions or concerns about these Terms, please contact us at <a href="mailto:info@geniuscvmaker.com" className="text-blue-500">info@geniuscvmaker.com</a>.</div>
								</ModalBody>
								<ModalFooter>
									<Button color="danger" onPress={onClose}>
										Close
									</Button>
									<Button color="success" onPress={loginWithGoogle}>
										I Accept Terms of Service
									</Button>
								</ModalFooter>
							</>
						)}
					</ModalContent>
				</Modal>
			</div>
		</>
	);
}

export default withPublic(Login);