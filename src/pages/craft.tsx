import React, { useState, useEffect } from 'react'
import { getFirestore, doc, collection, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Button, Card, CardHeader, CardBody, CardFooter, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { useRouter } from 'next/router'; 
import { toast } from 'react-hot-toast';
import { withProtected } from '../hook/route'

interface CvCraft {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    telephoneNumber: string;
    description: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    tiktok: string;
    youtube: string;
    github: string;
    workExperiences: any[];
    skills: any[];
    languages: any[];
    licenses: any[];
    certifications: any[];
    personalReferences: any[];
}

function Craft({ auth }) {
    const { user } = auth;
    const [cvCrafts, setCvCrafts] = useState<CvCraft[]>([]);
    const [currentCv, setCurrentCv] = useState<CvCraft | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();

    const initialCvState: CvCraft = {
        firstName: "",
        lastName: "",
        email: "",
        telephoneNumber: "",
        description: "",
        facebook: "",
        instagram: "",
        linkedin: "",
        tiktok: "",
        youtube: "",
        github: "",
        workExperiences: [],
        skills: [],
        languages: [],
        licenses: [],
        certifications: [],
        personalReferences: []
    };

    const fetchCvCrafts = async () => {
        const firestore = getFirestore();
        const cvCraftsRef = collection(doc(firestore, "users", user.uid), "cvCrafts");
        const cvCraftsSnapshot = await getDocs(cvCraftsRef);
        const cvCraftsList = cvCraftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CvCraft));
        setCvCrafts(cvCraftsList);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCurrentCv(currentCv => currentCv ? { ...currentCv, [name]: value } : null);
    };

    const handleModalOpen = (cv: CvCraft = initialCvState) => {
        setCurrentCv(cv);
        setIsEditing(!!cv.id);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setCurrentCv(null);
        setIsModalOpen(false);
    };

    const handleSubmit = async () => {
        const firestore = getFirestore();
        const cvCraftsRef = collection(doc(firestore, "users", user.uid), "cvCrafts");

        try {
            if (isEditing && currentCv?.id) {
                const cvDocRef = doc(cvCraftsRef, currentCv.id);
                const { id, ...cvData } = currentCv;
                await updateDoc(cvDocRef, cvData);
                toast.success("CV updated successfully");
            } else {
                await addDoc(cvCraftsRef, currentCv);
                toast.success("CV created successfully");
            }
            handleModalClose();
            fetchCvCrafts();
        } catch (error) {
            toast.error("Error saving CV");
        }
    };

    const handleDelete = async (cvId: string) => {
        const firestore = getFirestore();
        const cvCraftsRef = collection(doc(firestore, "users", user.uid), "cvCrafts");

        try {
            await deleteDoc(doc(cvCraftsRef, cvId));
            toast.success("CV deleted successfully");
            fetchCvCrafts();
        } catch (error) {
            toast.error("Error deleting CV");
        }
    };

    useEffect(() => {
        fetchCvCrafts();
    }, []);

    return (
        <div className="container mx-auto px-4 py-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">Crafted CVs</h1>
                <Button onClick={() => handleModalOpen()}>Create New CV</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cvCrafts.map((cv) => (
                    <Card key={cv.id} className="mb-4">
                        <CardHeader>
                            <h2 className="text-xl font-bold">{cv.firstName} {cv.lastName}</h2>
                        </CardHeader>
                        <CardBody>
                            <p>Email: {cv.email}</p>
                            <p>Phone: {cv.telephoneNumber}</p>
                            <p>Description: {cv.description}</p>
                            <p>Facebook: {cv.facebook}</p>
                            <p>Instagram: {cv.instagram}</p>
                            <p>LinkedIn: {cv.linkedin}</p>
                            <p>TikTok: {cv.tiktok}</p>
                            <p>YouTube: {cv.youtube}</p>
                            <p>GitHub: {cv.github}</p>
                        </CardBody>
                        <CardFooter>
                            <Button onClick={() => handleModalOpen(cv)}>Edit</Button>
                            <Button onClick={() => handleDelete(cv.id!)} color="danger">Delete</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {currentCv && (
                <Modal isOpen={isModalOpen} onClose={handleModalClose}>
                    <ModalHeader>
                        <h2>{isEditing ? "Edit CV" : "Create New CV"}</h2>
                    </ModalHeader>
                    <ModalBody>
                        <Input
                            type="text"
                            name="firstName"
                            label="First Name"
                            value={currentCv.firstName}
                            onChange={handleInputChange}
                            className="mb-4"
                            fullWidth
                        />
                        <Input
                            type="text"
                            name="lastName"
                            label="Last Name"
                            value={currentCv.lastName}
                            onChange={handleInputChange}
                            className="mb-4"
                            fullWidth
                        />
                        <Input
                            type="email"
                            name="email"
                            label="Email"
                            value={currentCv.email}
                            onChange={handleInputChange}
                            className="mb-4"
                            fullWidth
                        />
                        <Input
                            type="text"
                            name="telephoneNumber"
                            label="Phone"
                            value={currentCv.telephoneNumber}
                            onChange={handleInputChange}
                            className="mb-4"
                            fullWidth
                        />
                        <Textarea
                            name="description"
                            label="Description"
                            value={currentCv.description}
                            onChange={handleInputChange}
                            className="mb-4"
                            fullWidth
                        />
                        <Input
                            type="text"
                            name="facebook"
                            label="Facebook"
                            value={currentCv.facebook}
                            onChange={handleInputChange}
                            className="mb-4"
                            fullWidth
                        />
                        <Input
                            type="text"
                            name="instagram"
                            label="Instagram"
                            value={currentCv.instagram}
                            onChange={handleInputChange}
                            className="mb-4"
                            fullWidth
                        />
                        <Input
                            type="text"
                            name="linkedin"
                            label="LinkedIn"
                            value={currentCv.linkedin}
                            onChange={handleInputChange}
                            className="mb-4"
                            fullWidth
                        />
                        <Input
                            type="text"
                            name="tiktok"
                            label="TikTok"
                            value={currentCv.tiktok}
                            onChange={handleInputChange}
                            className="mb-4"
                            fullWidth
                        />
                        <Input
                            type="text"
                            name="youtube"
                            label="YouTube"
                            value={currentCv.youtube}
                            onChange={handleInputChange}
                            className="mb-4"
                            fullWidth
                        />
                        <Input
                            type="text"
                            name="github"
                            label="GitHub"
                            value={currentCv.github}
                            onChange={handleInputChange}
                            className="mb-4"
                            fullWidth
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={handleSubmit}>
                            {isEditing ? "Update CV" : "Create CV"}
                        </Button>
                    </ModalFooter>
                </Modal>
            )}
        </div>
    );
}

export default withProtected(Craft);
