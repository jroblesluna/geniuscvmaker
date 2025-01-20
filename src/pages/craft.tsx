import React, { useState, useEffect } from 'react';
import { getFirestore, doc, collection, getDoc, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Button, Card, CardHeader, CardBody, CardFooter, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Checkbox, DatePicker, Select, SelectItem } from "@nextui-org/react";
import { toast } from 'react-hot-toast';
import { withProtected } from '../hook/route';
import { I18nProvider } from "@react-aria/i18n";
import { parseDate } from "@internationalized/date";
import SvgEdit from '../components/svgEdit';
import SvgCancel from '../components/svgCancel';
import { useRouter } from 'next/router';
import { degrees, languagesList, proficiencyLevels, socialLinks } from '../utils/consts';

import { CvCraft } from '../interfaces/geniuscvmaker';

function Craft({ auth }) {
    const { user } = auth;
    const router = useRouter(); // Initialize Next.js router
    const [cvCrafts, setCvCrafts] = useState<CvCraft[]>([]);
    const [currentCv, setCurrentCv] = useState<CvCraft | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdatingState, setIsUpdatingState] = useState<{ [key: string]: boolean }>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWorkExperiencesModalOpen, setIsWorkExperiencesModalOpen] = useState(false);
    const [isLicensesModalOpen, setIsLicensesModalOpen] = useState(false);
    const [isCertificationsModalOpen, setIsCertificationsModalOpen] = useState(false);
    const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
    const [isLanguagesModalOpen, setIsLanguagesModalOpen] = useState(false);
    const [isPersonalReferencesModalOpen, setIsPersonalReferencesModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const setIsUpdating = (id: string, value: boolean) => {
        setIsUpdatingState(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

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

    const handleCreateUpdateCV = async () => {
        const firestore = getFirestore();
        const cvCraftsRef = collection(doc(firestore, "users", user.uid), "cvCrafts");

        try {
            if (isEditing && currentCv?.id) {
                const cvDocRef = doc(cvCraftsRef, currentCv.id);
                const { id, ...cvData } = currentCv;
                console.log("cv", currentCv);
                setIsUpdating(currentCv.id, true);
                await updateDoc(cvDocRef, cvData);
                setIsUpdating(currentCv.id, false);
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

    const formatDate = (year, month, day) => {
        // Ensure month and day are always two digits
        const formattedMonth = String(month).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        return `${year}-${formattedMonth}-${formattedDay}`;
    };

    const handleChange = (event, index, section, elementName = "") => {
        let fieldName, newValue;

        if (elementName === "") {
            const { name, value, type, checked } = event.target;
            fieldName = name;
            newValue = type === "checkbox" ? checked : value;
        } else {
            fieldName = elementName;
            const { year, month, day } = event;
            newValue = formatDate(year, month, day);
        }

        setCurrentCv(currentCv => {
            if (currentCv) {
                const updatedSection = [...currentCv[section]];
                updatedSection[index] = { ...updatedSection[index], [fieldName]: newValue };
                return { ...currentCv, [section]: updatedSection };
            }
            return currentCv;
        });
    };

    const handleWorkExperienceChange = (event, index, elementName = "") => {
        handleChange(event, index, 'workExperiences', elementName);
    };

    const handleLicenseChange = (event, index, elementName = "") => {
        handleChange(event, index, 'licenses', elementName);
    };

    const handleCertificationChange = (event, index, elementName = "") => {
        handleChange(event, index, 'certifications', elementName);
    };

    const handleSkillChange = (event, index, elementName = "") => {
        handleChange(event, index, 'skills', elementName);
    };

    const handleLanguageChange = (event, index, elementName = "") => {
        handleChange(event, index, 'languages', elementName);
    };

    const handlePersonalReferenceChange = (event, index, elementName = "") => {
        handleChange(event, index, 'personalReferences', elementName);
    };

    const handleWorkExperiencesModalOpen = (cv: CvCraft, index: number | null = null) => {
        setCurrentCv(cv);
        setIsEditing(!!cv.id);
        setIsWorkExperiencesModalOpen(true);
    };

    const handleLicensesModalOpen = (cv: CvCraft, index: number | null = null) => {
        setCurrentCv(cv);
        setIsEditing(!!cv.id);
        setIsLicensesModalOpen(true);
    };

    const handleCertificationsModalOpen = (cv: CvCraft, index: number | null = null) => {
        setCurrentCv(cv);
        setIsEditing(!!cv.id);
        setIsCertificationsModalOpen(true);
    };

    const handleSkillsModalOpen = (cv: CvCraft, index: number | null = null) => {
        setCurrentCv(cv);
        setIsEditing(!!cv.id);
        setIsSkillsModalOpen(true);
    };

    const handleLanguagesModalOpen = (cv: CvCraft, index: number | null = null) => {
        setCurrentCv(cv);
        setIsEditing(!!cv.id);
        setIsLanguagesModalOpen(true);
    };

    const handlePersonalReferencesModalOpen = (cv: CvCraft, index: number | null = null) => {
        setCurrentCv(cv);
        setIsEditing(!!cv.id);
        setIsPersonalReferencesModalOpen(true);
    };

    const handleWorkExperiencesModalClose = (saving: boolean = false) => {
        setIsWorkExperiencesModalOpen(false);
        if (saving) {
            handleCreateUpdateCV(); // Save changes when closing the modal
        }
    };

    const handleLicensesModalClose = (saving: boolean = false) => {
        setIsLicensesModalOpen(false);
        if (saving) {
            handleCreateUpdateCV(); // Save changes when closing the modal
        }
    };

    const handleCertificationsModalClose = (saving: boolean = false) => {
        setIsCertificationsModalOpen(false);
        if (saving) {
            handleCreateUpdateCV(); // Save changes when closing the modal
        }
    };

    const handleSkillsModalClose = (saving: boolean = false) => {
        setIsSkillsModalOpen(false);
        if (saving) {
            handleCreateUpdateCV(); // Save changes when closing the modal
        }
    };

    const handleLanguagesModalClose = (saving: boolean = false) => {
        setIsLanguagesModalOpen(false);
        if (saving) {
            handleCreateUpdateCV(); // Save changes when closing the modal
        }
    };

    const handlePersonalReferencesModalClose = (saving: boolean = false) => {
        setIsPersonalReferencesModalOpen(false);
        if (saving) {
            handleCreateUpdateCV(); // Save changes when closing the modal
        }
    };

    const handleAddWorkExperience = () => {
        setCurrentCv(currentCv => currentCv ? {
            ...currentCv,
            workExperiences: [...currentCv.workExperiences, { companyName: "", dateFrom: "", dateTo: "", current: false, position: "", achievements: "" }]
        } : null);
    };

    const handleAddLicense = () => {
        setCurrentCv(currentCv => currentCv ? {
            ...currentCv,
            licenses: [...currentCv.licenses, { institution: "", achieved: "", degree: "", title: "" }]
        } : null);
    };

    const handleAddCertification = () => {
        setCurrentCv(currentCv => currentCv ? {
            ...currentCv,
            certifications: [...currentCv.certifications, { institution: "", achieved: "", title: "", certificationID: "", certificationURL: "", expiration: "", perpetual: false }]
        } : null);
    };

    const handleAddSkill = () => {
        setCurrentCv(currentCv => currentCv ? {
            ...currentCv,
            skills: [...currentCv.skills, { skillName: "" }]
        } : null);
    };

    const handleAddLanguage = () => {
        setCurrentCv(currentCv => currentCv ? {
            ...currentCv,
            languages: [...currentCv.languages, { language: "", proficiencyLevel: "" }]
        } : null);
    };

    const handleAddPersonalReference = () => {
        setCurrentCv(currentCv => currentCv ? {
            ...currentCv,
            personalReferences: [...currentCv.personalReferences, { name: "", institution: "", position: "", telephoneNumber: "", email: "", }]
        } : null);
    };

    const handleRemoveWorkExperience = (index) => {
        setCurrentCv(currentCv => currentCv ? {
            ...currentCv,
            workExperiences: currentCv.workExperiences.filter((_, i) => i !== index)
        } : null);
    };

    const handleRemoveLicense = (index) => {
        setCurrentCv(currentCv => currentCv ? {
            ...currentCv,
            licenses: currentCv.licenses.filter((_, i) => i !== index)
        } : null);
    };

    const handleRemoveCertification = (index) => {
        setCurrentCv(currentCv => currentCv ? {
            ...currentCv,
            certifications: currentCv.certifications.filter((_, i) => i !== index)
        } : null);
    };

    const handleRemoveSkill = (index) => {
        setCurrentCv(currentCv => currentCv ? {
            ...currentCv,
            skills: currentCv.skills.filter((_, i) => i !== index)
        } : null);
    };

    const handleRemoveLanguage = (index) => {
        setCurrentCv(currentCv => currentCv ? {
            ...currentCv,
            languages: currentCv.languages.filter((_, i) => i !== index)
        } : null);
    };

    const handleRemovePersonalReference = (index) => {
        setCurrentCv(currentCv => currentCv ? {
            ...currentCv,
            personalReferences: currentCv.personalReferences.filter((_, i) => i !== index)
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
                    facebook: userData?.facebook,
                    instagram: userData?.instagram,
                    linkedin: userData?.linkedin,
                    tiktok: userData?.tiktok,
                    youtube: userData?.youtube,
                    github: userData?.github,
                }));

                //setUserData(userData);
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


    const handleSubmit = async (cv: CvCraft, index: number | null = null) => {

        // Handle submission logic here
        setIsProcessing(true);

        console.log(cv);
        try {
            const response = await fetch('/api/geniuscvmaker', {
                method: 'POST',//Don't get confused, this is always POST
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: user.uid,
                    firstName: cv.firstName,
                    lastName: cv.lastName,
                    email: cv.email,
                    telephoneNumber: cv.telephoneNumber,
                    about: cv.about,
                    facebook: cv.facebook,
                    instagram: cv.instagram,
                    linkedin: cv.linkedin,
                    tiktok: cv.tiktok,
                    youtube: cv.youtube,
                    github: cv.github,
                    geniusApp: 'craft',
                    geniusBody: cv,
                    status: 'writing',
                }),
            });
            const data = await response.json();
            console.log('Success:', data);
            if (data.requestPath != undefined) {
                toast.success("You created a new CV Request: " + data.requestPath.split("/").pop());
                router.push("/cvList");
            }
            else {
                if (data.error != undefined) {
                    toast.error(data.error + ' - ' + data.message);
                }
                else {
                    toast.error("Error creating CV request. Please contact Support.");
                }
            }

        } catch (error) {
            console.error('Error:', error);
            toast.error("Error requesting: " + error.message);
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
                    <Button color='primary' className='w-fit' onClick={() => handleModalOpen()}>Craft a New CV</Button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {
                    cvCrafts.map(
                        (cv) => (
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
                                    <div className='grid grid-cols-2 gap-2 mt-2'>
                                        <Button variant='ghost' isDisabled={isUpdatingState[cv.id ?? ''] || false} onClick={() => handleWorkExperiencesModalOpen(cv)}>Work Experiences ({cv.workExperiences.length})</Button>
                                        <Button variant='ghost' isDisabled={isUpdatingState[cv.id ?? ''] || false} onClick={() => handleLicensesModalOpen(cv)}>Licenses ({cv.licenses.length})</Button>
                                        <Button variant='ghost' isDisabled={isUpdatingState[cv.id ?? ''] || false} onClick={() => handleCertificationsModalOpen(cv)}>Certifications ({cv.certifications.length})</Button>
                                        <Button variant='ghost' isDisabled={isUpdatingState[cv.id ?? ''] || false} onClick={() => handleSkillsModalOpen(cv)}>Skills ({cv.skills.length})</Button>
                                        <Button variant='ghost' isDisabled={isUpdatingState[cv.id ?? ''] || false} onClick={() => handleLanguagesModalOpen(cv)}>Languages ({cv.languages.length})</Button>
                                        <Button variant='ghost' isDisabled={isUpdatingState[cv.id ?? ''] || false} onClick={() => handlePersonalReferencesModalOpen(cv)}>References ({cv.personalReferences.length})</Button>
                                    </div>
                                </CardBody>
                                <CardFooter className='flex flex-row items-center gap-4'>
                                    <div className='text-xl font-bold text-left w-full flex flex-row gap-2'>
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
                                    <Button isLoading={isProcessing} onClick={() => handleSubmit(cv)} className="appBlackOnCitrine w-full">
                                        Craft CV
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    )
                }
            </div>
            {
                currentCv && (
                    <Modal
                        isOpen={isModalOpen}
                        onClose={handleModalClose}
                        backdrop="blur"
                        scrollBehavior="inside"
                        size='xl'>
                        <ModalContent>
                            <ModalHeader className='flex flex-row items-center'>
                                <span className='text-xl font-bold text-left w-fit'>{isEditing ? "Edit CV" : "Create New CV"}</span>
                                <span className='text-sm font-light text-right w-full'>Complete with most accurate information</span>
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
                                            variant="underlined" />
                                        <Input
                                            type="text"
                                            name="lastName"
                                            label="Last Name"
                                            isRequired={true}
                                            value={currentCv.lastName}
                                            onChange={handleInputChange}
                                            fullWidth
                                            variant="underlined" />
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
                                            variant="underlined" />
                                        <Input
                                            type="text"
                                            name="telephoneNumber"
                                            label="Phone"
                                            isRequired={true}
                                            value={currentCv.telephoneNumber}
                                            onChange={handleInputChange}
                                            fullWidth
                                            variant="underlined" />
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
                                        {socialLinks.map(socialNetwork => (
                                            <Input
                                                type="text"
                                                name={socialNetwork.name}
                                                label={socialNetwork.name.charAt(0).toUpperCase() + socialNetwork.name.slice(1)}
                                                value={currentCv[socialNetwork.name]}
                                                onChange={handleInputChange}
                                                fullWidth
                                                startContent={
                                                    <>
                                                        <img src={`/assets/svg/${socialNetwork.name}.svg`} width={20} className="mr-1" />
                                                        <span className="text-default-400 text-small">{socialNetwork.baseUrl}</span>
                                                    </>
                                                }
                                                variant="underlined"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button onClick={handleCreateUpdateCV}>
                                    {isEditing ? "Update CV" : "Create CV"}
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                )
            }
            {
                currentCv && isWorkExperiencesModalOpen && (
                    <Modal
                        isOpen={isWorkExperiencesModalOpen}
                        onClose={handleWorkExperiencesModalClose}
                        backdrop="blur"
                        scrollBehavior="inside"
                        size='lg'>
                        <ModalContent>
                            {(onWorkExperiencesModalClose) => (
                                <>
                                    <ModalHeader className='flex flex-row items-center'>
                                        <span className='text-xl font-bold text-left w-fit'>Work Experiences</span>
                                        <span className='text-sm font-light text-right w-full'>Complete with most accurate information</span>
                                    </ModalHeader>
                                    <ModalBody>
                                        <div className="flex flex-col gap-4">
                                            {currentCv.workExperiences.map((workExperience, index) => (
                                                <div key={index} className=" bg-gray-50 border border-gray-300 p-2 rounded-lg shadow-lg">
                                                    <div className='flex flex-row '>
                                                        <Input
                                                            type="text"
                                                            name="companyName"
                                                            label="Company Name"
                                                            value={workExperience.companyName}
                                                            onChange={(event) => handleWorkExperienceChange(event, index)}
                                                            fullWidth
                                                            variant="underlined" />
                                                        <Button
                                                            isIconOnly
                                                            color="danger"
                                                            variant="flat"
                                                            aria-label="Delete"
                                                            size="sm"
                                                            radius='sm'
                                                            onClick={() => handleRemoveWorkExperience(index)}>
                                                            <SvgCancel />
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <I18nProvider locale="en-CA">
                                                            <DatePicker
                                                                showMonthAndYearPickers
                                                                name='dateFrom'
                                                                label="Date From"
                                                                value={workExperience.dateFrom.length > 0 ? parseDate(workExperience.dateFrom) : undefined}
                                                                onChange={(event) => handleWorkExperienceChange(event, index, 'dateFrom')}
                                                                fullWidth
                                                                variant="underlined" />
                                                            <DatePicker
                                                                name="dateTo"
                                                                label="Date To"
                                                                value={workExperience.dateTo.length > 0 ? parseDate(workExperience.dateTo) : undefined}
                                                                onChange={(event) => handleWorkExperienceChange(event, index, 'dateTo')}
                                                                fullWidth
                                                                isDisabled={workExperience.current}
                                                                variant="underlined" />
                                                        </I18nProvider>
                                                        <Checkbox
                                                            name="current"
                                                            checked={workExperience.current}
                                                            isSelected={workExperience.current}
                                                            size='sm'
                                                            onChange={(event) => handleWorkExperienceChange(event, index)}>
                                                            Current Job
                                                        </Checkbox>
                                                    </div>
                                                    <Input
                                                        type="text"
                                                        name="position"
                                                        label="Position"
                                                        value={workExperience.position}
                                                        onChange={(event) => handleWorkExperienceChange(event, index)}
                                                        fullWidth
                                                        variant="underlined" />
                                                    <Textarea
                                                        name="achievements"
                                                        label="Achievements"
                                                        value={workExperience.achievements}
                                                        onChange={(event) => handleWorkExperienceChange(event, index)}
                                                        fullWidth
                                                        variant="underlined" />
                                                </div>
                                            ))}
                                        </div>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color='primary' onClick={handleAddWorkExperience}>Add Work Experience</Button>
                                        <Button color='danger' onClick={onWorkExperiencesModalClose}>Cancel</Button>
                                        <Button color='success' onClick={() => handleWorkExperiencesModalClose(true)}>Save and Close</Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                )
            }
            {
                currentCv && isLicensesModalOpen && (
                    <Modal
                        isOpen={isLicensesModalOpen}
                        onClose={handleLicensesModalClose}
                        backdrop="blur"
                        scrollBehavior="inside"
                        size='lg'>
                        <ModalContent>
                            {(onLicensesModalClose) => (
                                <>
                                    <ModalHeader className='flex flex-row items-center'>
                                        <span className='text-xl font-bold text-left w-fit'>Licenses</span>
                                        <span className='text-sm font-light text-right w-full'>Complete with most accurate information</span>
                                    </ModalHeader>
                                    <ModalBody>
                                        <div className="flex flex-col gap-4">
                                            {currentCv.licenses.map((license, index) => (
                                                <div key={index} className=" bg-gray-50 border border-gray-300 p-2 rounded-lg shadow-lg">
                                                    <div className='flex flex-row gap-2'>
                                                        <Input
                                                            type="text"
                                                            name="institution"
                                                            label="Issuer Institution"
                                                            value={license.institution}
                                                            onChange={(event) => handleLicenseChange(event, index)}
                                                            fullWidth
                                                            variant="underlined" />
                                                        <Button
                                                            isIconOnly
                                                            color="danger"
                                                            variant="flat"
                                                            aria-label="Delete"
                                                            size="sm"
                                                            radius='sm'
                                                            onClick={() => handleRemoveLicense(index)}>
                                                            <SvgCancel />
                                                        </Button>
                                                    </div>
                                                    <div className='flex flex-row gap-2'>
                                                        <I18nProvider locale="en-CA">
                                                            <DatePicker
                                                                showMonthAndYearPickers
                                                                name='achieved'
                                                                label="Achieved"
                                                                value={license.achieved.length > 0 ? parseDate(license.achieved) : undefined}
                                                                onChange={(event) => handleLicenseChange(event, index, 'achieved')}
                                                                fullWidth
                                                                variant="underlined" />
                                                        </I18nProvider>
                                                        <style>{"ul {padding-left: 0px !important;}"}</style>
                                                        <Select
                                                            name="degree"
                                                            label="Degree"
                                                            items={degrees}
                                                            placeholder="Choose a Degree"
                                                            selectedKeys={[license.degree]}
                                                            onChange={(event) => handleLicenseChange(event, index)} // Pass selected value directly
                                                            fullWidth
                                                            variant='underlined'>
                                                            {(degree) => <SelectItem key={degree.key}>{degree.label}</SelectItem>}
                                                        </Select>
                                                    </div>
                                                    <Input
                                                        type="text"
                                                        name="title"
                                                        label="Professional License or Title"
                                                        value={license.title}
                                                        onChange={(event) => handleLicenseChange(event, index)}
                                                        fullWidth
                                                        variant="underlined" />
                                                </div>
                                            ))}
                                        </div>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color='primary' onClick={handleAddLicense}>Add License</Button>
                                        <Button color='danger' onClick={onLicensesModalClose}>Cancel</Button>
                                        <Button color='success' onClick={() => handleLicensesModalClose(true)}>Save and Close</Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                )
            }
            {
                currentCv && isCertificationsModalOpen && (
                    <Modal
                        isOpen={isCertificationsModalOpen}
                        onClose={handleCertificationsModalClose}
                        backdrop="blur"
                        scrollBehavior="inside"
                        size='lg'>
                        <ModalContent>
                            {(onCertificationsModalClose) => (
                                <>
                                    <ModalHeader className='flex flex-row items-center'>
                                        <span className='text-xl font-bold text-left w-fit'>Certifications</span>
                                        <span className='text-sm font-light text-right w-full'>Complete with most accurate information</span>
                                    </ModalHeader>
                                    <ModalBody>
                                        <div className="flex flex-col gap-4">
                                            {currentCv.certifications.map((certification, index) => (
                                                <div key={index} className=" bg-gray-50 border border-gray-300 p-2 rounded-lg shadow-lg">
                                                    <div className='flex flex-row gap-2'>
                                                        <Input
                                                            type="text"
                                                            name="institution"
                                                            label="Issuer Institution"
                                                            value={certification.institution}
                                                            onChange={(event) => handleCertificationChange(event, index)}
                                                            fullWidth
                                                            variant="underlined" />

                                                        <Button
                                                            isIconOnly
                                                            color="danger"
                                                            variant="flat"
                                                            aria-label="Delete"
                                                            size="sm"
                                                            radius='sm'
                                                            onClick={() => handleRemoveCertification(index)}>
                                                            <SvgCancel />
                                                        </Button>
                                                    </div>
                                                    <div className='flex flex-row gap-2'>
                                                        <I18nProvider locale="en-CA">
                                                            <DatePicker
                                                                showMonthAndYearPickers
                                                                name='achieved'
                                                                label="Achieved"
                                                                value={certification.achieved.length > 0 ? parseDate(certification.achieved) : undefined}
                                                                onChange={(event) => handleCertificationChange(event, index, 'achieved')}
                                                                fullWidth
                                                                variant="underlined" />
                                                        </I18nProvider>
                                                        <I18nProvider locale="en-CA">
                                                            <DatePicker
                                                                showMonthAndYearPickers
                                                                name='expiration'
                                                                label="Expiration"
                                                                value={certification.expiration.length > 0 ? parseDate(certification.expiration) : undefined}
                                                                onChange={(event) => handleCertificationChange(event, index, 'expiration')}
                                                                fullWidth
                                                                isDisabled={certification.perpetual}
                                                                variant="underlined" />
                                                        </I18nProvider>
                                                        <Checkbox
                                                            name="perpetual"
                                                            checked={certification.perpetual}
                                                            isSelected={certification.perpetual}
                                                            size='sm'
                                                            onChange={(event) => handleCertificationChange(event, index)}>
                                                            Doesn't expire
                                                        </Checkbox>

                                                    </div>
                                                    <div className='flex flex-col gap-2'>
                                                        <Input
                                                            type="text"
                                                            name="title"
                                                            label="Certification Title"
                                                            value={certification.title}
                                                            onChange={(event) => handleCertificationChange(event, index)}
                                                            fullWidth
                                                            variant="underlined" />
                                                    </div>
                                                    <div className='flex flex-row gap-2'>
                                                        <Input
                                                            type="text"
                                                            name="certificationID"
                                                            label="Certification ID"
                                                            value={certification.certificationID}
                                                            onChange={(event) => handleCertificationChange(event, index)}
                                                            fullWidth
                                                            className='w-fit'
                                                            variant="underlined" />
                                                        <Input
                                                            type="text"
                                                            name="certificationURL"
                                                            label="Certification URL"
                                                            value={certification.certificationURL}
                                                            onChange={(event) => handleCertificationChange(event, index)}
                                                            fullWidth
                                                            variant="underlined" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color='primary' onClick={handleAddCertification}>Add Certification</Button>
                                        <Button color='danger' onClick={onCertificationsModalClose}>Cancel</Button>
                                        <Button color='success' onClick={() => handleCertificationsModalClose(true)}>Save and Close</Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                )
            }
            {
                currentCv && isSkillsModalOpen && (
                    <Modal
                        isOpen={isSkillsModalOpen}
                        onClose={handleSkillsModalClose}
                        backdrop="blur"
                        scrollBehavior="inside"
                        size='lg'>
                        <ModalContent>
                            {(onSkillsModalClose) => (
                                <>
                                    <ModalHeader className='flex flex-row text-md'>
                                        <span className='text-xl font-bold text-left w-fit'>Skills</span>
                                        <span className='text-sm font-light text-right w-full'>Example: Python, Management, Teamwork...</span>
                                    </ModalHeader>
                                    <ModalBody>
                                        <div className="flex flex-col gap-4">
                                            <div className='grid grid-cols-3'>
                                                {currentCv.skills.map((skill, index) => (
                                                    <div key={index} className=" bg-gray-50 border border-gray-300 p-2 rounded-lg shadow-lg">
                                                        <div className='flex flex-row gap-2'>
                                                            <Input
                                                                type="text"
                                                                name="skillName"
                                                                label="Skill Name"
                                                                value={skill.skillName}
                                                                onChange={(event) => handleSkillChange(event, index)}
                                                                fullWidth
                                                                variant="underlined" />

                                                            <Button
                                                                isIconOnly
                                                                color="danger"
                                                                variant="flat"
                                                                aria-label="Delete"
                                                                size="sm"
                                                                radius='sm'
                                                                onClick={() => handleRemoveSkill(index)}>
                                                                <SvgCancel />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color='primary' onClick={handleAddSkill}>Add Skill</Button>
                                        <Button color='danger' onClick={onSkillsModalClose}>Cancel</Button>
                                        <Button color='success' onClick={() => handleSkillsModalClose(true)}>Save and Close</Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                )
            }
            {
                currentCv && isLanguagesModalOpen && (
                    <Modal
                        isOpen={isLanguagesModalOpen}
                        onClose={handleLanguagesModalClose}
                        backdrop="blur"
                        scrollBehavior="inside"
                        size='lg'>
                        <ModalContent>
                            {(onLanguagesModalClose) => (
                                <>
                                    <ModalHeader className='flex flex-row items-center'>
                                        <span className='text-xl font-bold text-left w-fit'>Languages</span>
                                        <span className='text-sm font-light text-right w-full'>Complete with most accurate information</span>
                                    </ModalHeader>
                                    <ModalBody>
                                        <div className="flex flex-col gap-4">
                                            {currentCv.languages.map((language, index) => (
                                                <div key={index} className=" bg-gray-50 border border-gray-300 p-2 rounded-lg shadow-lg">
                                                    <div className='flex flex-row gap-2'>
                                                        <style>{"ul {padding-left: 0px !important;}"}</style>
                                                        <Select
                                                            name="language"
                                                            label="Language"
                                                            items={languagesList}
                                                            placeholder="Choose a Language"
                                                            selectedKeys={[language.language]}
                                                            onChange={(event) => handleLanguageChange(event, index)} // Pass selected value directly
                                                            fullWidth
                                                            variant='underlined'>
                                                            {(language) => <SelectItem key={language.key}>{language.label}</SelectItem>}
                                                        </Select>
                                                        <Select
                                                            name="proficiencyLevel"
                                                            label="Proficiency Level"
                                                            items={proficiencyLevels}
                                                            placeholder="Choose CEFR Level"
                                                            selectedKeys={[language.proficiencyLevel]}
                                                            onChange={(event) => handleLanguageChange(event, index)} // Pass selected value directly
                                                            fullWidth
                                                            variant='underlined'>
                                                            {(proficiencyLevel) => <SelectItem key={proficiencyLevel.key}>{proficiencyLevel.label}</SelectItem>}
                                                        </Select>
                                                        <Button
                                                            isIconOnly
                                                            color="danger"
                                                            variant="flat"
                                                            aria-label="Delete"
                                                            size="sm"
                                                            radius='sm'
                                                            onClick={() => handleRemoveLanguage(index)}>
                                                            <SvgCancel />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                        </div>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color='primary' onClick={handleAddLanguage}>Add Language</Button>
                                        <Button color='danger' onClick={onLanguagesModalClose}>Cancel</Button>
                                        <Button color='success' onClick={() => handleLanguagesModalClose(true)}>Save and Close</Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                )
            }
            {
                currentCv && isPersonalReferencesModalOpen && (
                    <Modal
                        isOpen={isPersonalReferencesModalOpen}
                        onClose={handlePersonalReferencesModalClose}
                        backdrop="blur"
                        scrollBehavior="inside"
                        size='lg'>
                        <ModalContent>
                            {(onPersonalReferencesModalClose) => (
                                <>
                                    <ModalHeader className='flex flex-row items-center'>
                                        <span className='text-xl font-bold text-left w-fit'>Personal References</span>
                                        <span className='text-sm font-light text-right w-full'>Complete with most accurate information</span>
                                    </ModalHeader>
                                    <ModalBody>
                                        <div className="flex flex-col gap-4">
                                            {currentCv.personalReferences.map((personalReference, index) => (
                                                <div key={index} className=" bg-gray-50 border border-gray-300 p-2 rounded-lg shadow-lg">
                                                    <div className='flex flex-row gap-2'>
                                                        <Input
                                                            type="text"
                                                            name="name"
                                                            label="Name"
                                                            value={personalReference.name}
                                                            onChange={(event) => handlePersonalReferenceChange(event, index)}
                                                            fullWidth
                                                            variant="underlined" />
                                                        <Button
                                                            isIconOnly
                                                            color="danger"
                                                            variant="flat"
                                                            aria-label="Delete"
                                                            size="sm"
                                                            radius='sm'
                                                            onClick={() => handleRemovePersonalReference(index)}>
                                                            <SvgCancel />
                                                        </Button>
                                                    </div>
                                                    <div className='grid grid-cols-2 gap-2'>
                                                        <Input
                                                            type="text"
                                                            name="institution"
                                                            label="Institution"
                                                            value={personalReference.institution}
                                                            onChange={(event) => handlePersonalReferenceChange(event, index)}
                                                            fullWidth
                                                            variant="underlined" />
                                                        <Input
                                                            type="text"
                                                            name="position"
                                                            label="Position"
                                                            value={personalReference.position}
                                                            onChange={(event) => handlePersonalReferenceChange(event, index)}
                                                            fullWidth
                                                            variant="underlined" />
                                                        <Input
                                                            type="text"
                                                            name="telephoneNumber"
                                                            label="Telephone Number"
                                                            value={personalReference.telephoneNumber}
                                                            onChange={(event) => handlePersonalReferenceChange(event, index)}
                                                            fullWidth
                                                            variant="underlined" />
                                                        <Input
                                                            type="text"
                                                            name="email"
                                                            label="Email"
                                                            value={personalReference.email}
                                                            onChange={(event) => handlePersonalReferenceChange(event, index)}
                                                            fullWidth
                                                            variant="underlined" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color='primary' onClick={handleAddPersonalReference}>Add Personal Reference</Button>
                                        <Button color='danger' onClick={onPersonalReferencesModalClose}>Cancel</Button>
                                        <Button color='success' onClick={() => handlePersonalReferencesModalClose(true)}>Save and Close</Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                )
            }





        </div >
    );
}

export default withProtected(Craft);
