import React, { useState, useEffect } from 'react';
import { getFirestore, doc, collection, getDoc, getDocs, addDoc, updateDoc, deleteDoc, DocumentData } from "firebase/firestore";
import { Button, Card, CardHeader, CardBody, CardFooter, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Checkbox } from "@nextui-org/react";
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { withProtected } from '../hook/route';
import Image from 'next/image';
import SvgEdit from '../components/svgEdit';
import SvgCancel from '../components/svgCancel';

interface CvCraft {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    telephoneNumber: string;
    about: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    tiktok: string;
    youtube: string;
    github: string;
    workExperiences: WorkExperience[];
    skills: any[];
    languages: any[];
    licenses: any[];
    certifications: any[];
    personalReferences: any[];
}

interface WorkExperience {
    companyName: string;
    dateFrom: string;
    dateTo: string;
    current: boolean;
    position: string;
    achievements: string;
}

function Craft({ auth }) {
    const { user } = auth;
    const [userData, setUserData] = useState<DocumentData | null>(null);
    const [cvCrafts, setCvCrafts] = useState<CvCraft[]>([]);
    const [currentCv, setCurrentCv] = useState<CvCraft | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isWorkExperienceModalOpen, setIsWorkExperienceModalOpen] = useState(false);
    const [currentWorkExperienceIndex, setCurrentWorkExperienceIndex] = useState<number | null>(null);
    const router = useRouter();
    const socialLinks = [
        { name: 'facebook', baseUrl: 'https://facebook.com/' },
        { name: 'linkedin', baseUrl: 'https://linkedin.com/in/' },
        { name: 'github', baseUrl: 'https://github.com/' },
        { name: 'youtube', baseUrl: 'https://youtube.com/@' },
        { name: 'instagram', baseUrl: 'https://instagram.com/' },
        { name: 'tiktok', baseUrl: 'https://tiktok.com/@' }
    ];

    const [initialCvState, setInitialCvState] = useState<CvCraft>(
        {
            firstName: "",
            lastName: "",
            email: "",
            telephoneNumber: "",
            about: "",
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
        }
    );

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

    const handleWorkExperienceChange = (event, index) => {
        const { name, value, type, checked } = event.target;
        const newValue = type === "checkbox" ? checked : value;
        setCurrentCv(currentCv => {
            if (currentCv) {
                const updatedWorkExperiences = [...currentCv.workExperiences];
                updatedWorkExperiences[index] = { ...updatedWorkExperiences[index], [name]: newValue };
                return { ...currentCv, workExperiences: updatedWorkExperiences };
            }
            return currentCv;
        });
    };

    const handleWorkExperienceModalOpen = (cv: CvCraft, index: number | null = null) => {
        setCurrentCv(cv);
        setIsEditing(!!cv.id);
        setCurrentWorkExperienceIndex(index);
        setIsWorkExperienceModalOpen(true);
    };

    const handleWorkExperienceModalClose = (saving: boolean = false) => {
        setCurrentWorkExperienceIndex(null);
        setIsWorkExperienceModalOpen(false);
        if (saving) {
            handleSubmit(); // Save changes when closing the modal
        }
    };

    const handleAddWorkExperience = () => {
        setCurrentCv(currentCv => currentCv ? {
            ...currentCv,
            workExperiences: [...currentCv.workExperiences, { companyName: "", dateFrom: "", dateTo: "", current: false, position: "", achievements: "" }]
        } : null);
    };

    const handleRemoveWorkExperience = (index) => {
        setCurrentCv(currentCv => currentCv ? {
            ...currentCv,
            workExperiences: currentCv.workExperiences.filter((_, i) => i !== index)
        } : null);
    };

    async function fetchUserProfile() {
        try {
            const firestore = getFirestore();
            const userDocRef = doc(firestore, "users", user.uid);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();

                setInitialCvState(prevState => ({
                    ...prevState,
                    firstName: userData?.firstName,
                    lastName: userData?.lastName,
                    email: userData?.email,
                    telephoneNumber: userData?.telephoneNumber,
                    about: userData?.about,
                }));

                setUserData(userData);
                return true;
            } else {
                console.log("The user document doesn't exist");
                return false;
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return false;
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchCvCrafts();
    }, []);

    function truncateText(text, wordLimit) {
        const words = text.split(' ');
        return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : text;
    }

    return (
        <div className="container mx-auto px-4 py-4">
            <div className="mb-8 grid grid-cols-2">
                <div className="text-3xl font-bold mb-4">Crafted CVs</div>
                <div className='text-right'>
                    <Button className='w-fit' onClick={() => handleModalOpen()}>Craft a New CV</Button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cvCrafts.map((cv) => (
                    <Card key={cv.id} className="mb-4">
                        <CardHeader className='flex flex-row items-start'>
                            <div className='flex flex-col items-start w-full'>
                                <div className="text-xl font-bold justify-start">{cv.firstName} {cv.lastName}</div>
                            </div>
                            <div className='flex flex-row text-end items-end justify-end w-fit'>
                                <Button isIconOnly color="primary" variant="light" aria-label="Edit" size="sm" radius='sm' onClick={() => handleModalOpen(cv)}>
                                    <SvgEdit />
                                </Button>
                                <Button isIconOnly color="danger" variant="light" aria-label="Delete" size="sm" radius='sm' onClick={() => handleDelete(cv.id!)}>
                                    <SvgCancel />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <p><b>Email:</b> {cv.email}</p>
                            <p><b>Phone:</b> {cv.telephoneNumber}</p>
                            <p><b>Description:</b> {truncateText(cv.about, 10)}</p>
                            <Button onClick={() => handleWorkExperienceModalOpen(cv)}>Edit Work Experiences ({cv.workExperiences.length})</Button>
                        </CardBody>
                        <CardFooter>
                            <div className='flex flex-row gap-2'>
                                {socialLinks.map(({ name, baseUrl }) => (
                                    <a
                                        key={name}
                                        href={cv[name].length > 0 ? `${baseUrl}${cv[name]}` : undefined}
                                        target={cv[name].length > 0 ? "_blank" : undefined} rel="noopener noreferrer" >
                                        <img
                                            src={`/assets/svg/${name}${cv[name].length > 0 ? '' : '_off'}.svg`}
                                            width={20}
                                            height={20}
                                            alt={name}
                                        />
                                    </a>
                                ))}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {currentCv && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    backdrop="blur"
                    scrollBehavior="inside"
                    size='xl'
                >
                    <ModalContent>
                        <ModalHeader>
                            <h2>{isEditing ? "Edit CV" : "Create New CV"}</h2>
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col">
                                <div className="mb-4">Please review the following information, it's going to be used for generate your CV.</div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Input
                                        type="text"
                                        name="firstName"
                                        label="First Name"
                                        isRequired={true}
                                        value={currentCv.firstName}
                                        onChange={handleInputChange}
                                        fullWidth
                                        variant="underlined"
                                    />
                                    <Input
                                        type="text"
                                        name="lastName"
                                        label="Last Name"
                                        isRequired={true}
                                        value={currentCv.lastName}
                                        onChange={handleInputChange}
                                        fullWidth
                                        variant="underlined"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Input
                                        type="text"
                                        name="email"
                                        label="Email"
                                        isRequired={true}
                                        value={currentCv.email}
                                        onChange={handleInputChange}
                                        fullWidth
                                        variant="underlined"
                                    />
                                    <Input
                                        type="text"
                                        name="telephoneNumber"
                                        label="Phone"
                                        isRequired={true}
                                        value={currentCv.telephoneNumber}
                                        onChange={handleInputChange}
                                        fullWidth
                                        variant="underlined"
                                    />
                                </div>
                                <div className="flex flex-col sm:col-span-2 gap-4">
                                    <Textarea
                                        name="about"
                                        label="About"
                                        isRequired={true}
                                        value={currentCv.about}
                                        onChange={handleInputChange}
                                        fullWidth
                                        variant="underlined" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        type="text"
                                        name="facebook"
                                        label="Facebook"
                                        value={currentCv.facebook}
                                        onChange={handleInputChange}
                                        fullWidth
                                        startContent={
                                            <>
                                                <img src="/assets/svg/facebook.svg" width={20} className='mr-1' />
                                                <span className="text-default-400 text-small">facebook.com/</span>
                                            </>
                                        }
                                        variant="underlined" />
                                    <Input
                                        type="text"
                                        name="instagram"
                                        label="Instagram"
                                        value={currentCv.instagram}
                                        onChange={handleInputChange}
                                        fullWidth
                                        startContent={
                                            <>
                                                <img src="/assets/svg/instagram.svg" width={20} className='mr-1' />
                                                <span className="text-default-400 text-small">instagram.com/</span>
                                            </>
                                        }

                                        variant="underlined" />
                                    <Input
                                        type="text"
                                        name="linkedin"
                                        label="LinkedIn"
                                        value={currentCv.linkedin}
                                        onChange={handleInputChange}
                                        fullWidth
                                        startContent={
                                            <>
                                                <img src="/assets/svg/linkedin.svg" width={20} className='mr-1' />
                                                <span className="text-default-400 text-small">linkedin.com/in/</span>
                                            </>
                                        }
                                        variant="underlined" />
                                    <Input
                                        type="text"
                                        name="tiktok"
                                        label="TikTok"
                                        value={currentCv.tiktok}
                                        onChange={handleInputChange}
                                        fullWidth
                                        startContent={
                                            <>
                                                <img src="/assets/svg/tiktok.svg" width={20} className='mr-1' />
                                                <span className="text-default-400 text-small">tiktok.com/@</span>
                                            </>
                                        }
                                        variant="underlined" />
                                    <Input
                                        type="text"
                                        name="youtube"
                                        label="YouTube"
                                        value={currentCv.youtube}
                                        onChange={handleInputChange}
                                        fullWidth
                                        startContent={
                                            <>
                                                <img src="/assets/svg/youtube.svg" width={20} className='mr-1' />
                                                <span className="text-default-400 text-small">youtube.com/@</span>
                                            </>}
                                        variant="underlined" />
                                    <Input
                                        type="text"
                                        name="github"
                                        label="GitHub"
                                        value={currentCv.github}
                                        onChange={handleInputChange}
                                        fullWidth
                                        startContent={
                                            <>
                                                <img src="/assets/svg/github.svg" width={20} className='mr-1' />
                                                <span className="text-default-400 text-small">github.com/</span>
                                            </>}
                                        variant="underlined" />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={handleSubmit}>
                                {isEditing ? "Update CV" : "Create CV"}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}

            {currentCv && isWorkExperienceModalOpen && (
                <Modal
                    isOpen={isWorkExperienceModalOpen}
                    onClose={handleWorkExperienceModalClose}
                    backdrop="blur"
                    scrollBehavior="inside"
                    size='lg'
                >
                    <ModalContent>
                        {(onWorkExperienceModalClose) => (
                            <>

                                <ModalHeader>
                                    <h2>Edit Work Experience</h2>
                                </ModalHeader>
                                <ModalBody>
                                    <div className="flex flex-col">
                                        {currentCv.workExperiences.map((workExperience, index) => (
                                            <div key={index} className="mb-4">
                                                <Input
                                                    type="text"
                                                    name="companyName"
                                                    label="Company Name"
                                                    value={workExperience.companyName}
                                                    onChange={(event) => handleWorkExperienceChange(event, index)}
                                                    fullWidth
                                                    variant="underlined"
                                                />
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <Input
                                                        type="date"
                                                        name="dateFrom"
                                                        label="Date From"
                                                        value={workExperience.dateFrom}
                                                        onChange={(event) => handleWorkExperienceChange(event, index)}
                                                        fullWidth
                                                        variant="underlined"
                                                    />
                                                    <Input
                                                        type="date"
                                                        name="dateTo"
                                                        label="Date To"
                                                        value={workExperience.dateTo}
                                                        onChange={(event) => handleWorkExperienceChange(event, index)}
                                                        fullWidth
                                                        disabled={workExperience.current}
                                                        variant="underlined"
                                                    />
                                                    <Checkbox
                                                        name="current"
                                                        checked={workExperience.current}
                                                        size='sm'
                                                        onChange={(event) => handleWorkExperienceChange(event, index)}>
                                                        Current
                                                    </Checkbox>
                                                </div>
                                                <Input
                                                    type="text"
                                                    name="position"
                                                    label="Position"
                                                    value={workExperience.position}
                                                    onChange={(event) => handleWorkExperienceChange(event, index)}
                                                    fullWidth
                                                    variant="underlined"
                                                />
                                                <Textarea
                                                    name="achievements"
                                                    label="Achievements"
                                                    value={workExperience.achievements}
                                                    onChange={(event) => handleWorkExperienceChange(event, index)}
                                                    fullWidth
                                                    variant="underlined"
                                                />
                                                <Button
                                                    color="danger"
                                                    onClick={() => handleRemoveWorkExperience(index)}
                                                    className="mt-2"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                        <Button onClick={handleAddWorkExperience} className="mt-4">
                                            Add Work Experience
                                        </Button>
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button onClick={onWorkExperienceModalClose}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => handleWorkExperienceModalClose(true)}>
                                        Save and Close
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            )}
        </div>
    );
}

export default withProtected(Craft);
