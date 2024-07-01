import { getFirestore, doc, getDoc, DocumentData } from "firebase/firestore";
import React, { useState, useEffect } from 'react'
import { Tabs, Tab, Card, CardBody, Button, Textarea, Input } from "@nextui-org/react";
import { useRouter } from 'next/router'; // Import Next.js router
import { toast } from 'react-hot-toast';
import { withProtected } from '../hook/route'

const socialLinks = [
    { name: 'facebook', baseUrl: 'https://facebook.com/' },
    { name: 'instagram', baseUrl: 'https://instagram.com/' },
    { name: 'linkedin', baseUrl: 'https://linkedin.com/in/' },
    { name: 'tiktok', baseUrl: 'https://tiktok.com/@' },
    { name: 'youtube', baseUrl: 'https://youtube.com/@' },
    { name: 'github', baseUrl: 'https://github.com/' },
];

function Scratch({ auth }) {
    const { user, setUser, logout } = auth;
    const [userData, setUserData] = useState<DocumentData | null>(null);
    const router = useRouter(); // Initialize Next.js router
    const [answers, setAnswers] = useState({
        passion: "",
        field_of_study: "",
        motivation: "",
        studies: "",
        skills: "",
        languages: "",
        experience: "",
        activities: "",
        envision: ""
    });

    const [selectedTab, setSelectedTab] = useState("tab.you");
    const [focusedTextarea, setFocusedTextarea] = useState("passion");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleTextareaChange = (name) => (event) => {
        setAnswers({ ...answers, [name]: event.target.value });
    };

    const handleTabChange = (tabKey) => {
        setSelectedTab(tabKey);
    };

    const focusTextarea = (name) => {
        setFocusedTextarea(name);
    };

    useEffect(() => {
        handleTabChange(selectedTab);
    }, [selectedTab]);



    const handleSubmit = async (event) => {
        event.preventDefault();
        let emptyField = false;
        let emptyFieldKey = "";
        let tabKey = "";

        for (const key in answers) {
            if (answers[key] === "") {
                emptyField = true;
                emptyFieldKey = key;
                break;
            }
        }

        if (emptyField) {
            tabs.forEach(tab => {
                const question = tab.questions.find(qItem => qItem.key === emptyFieldKey);
                if (question) {
                    tabKey = tab.key;
                }
            });
            toast.error('Please fill in all fields before submitting.');
            handleTabChange(tabKey);
            focusTextarea(emptyFieldKey);
        }
        else {
            // Handle submission logic here
            setIsProcessing(true);
            setFocusedTextarea("");
            console.log("Submitting Form:", answers);
            console.log("userData", userData);

            const response = await fetch('/api/geniuscvmaker', {
                method: 'POST',//Don't get confused, this is always POST
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: user.uid,
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
                    geniusApp: 'scratch',
                    geniusBody: answers,
                    status: 'writing',
                }),
            });
            const data = await response.json();
            if (data.requestPath != undefined) {
                toast.success("You created a new CV Request: " + data.requestPath.split("/").pop());
            }
            else {
                toast.error("Error creating CV request. Please contact Support.");
            }



            router.push("/cvList");
        }
    };

    const tabs = [
        {
            key: "tab.you",
            label: "1. You",
            questions: [
                {
                    key: "passion",
                    question: "What are you passionate about?",
                    label: "Activities you truly love to do, including interests and hobbies.",
                    example: "I'm really passionate about fashion, styling, and luxury brands. I love following the latest trends, experimenting with different looks, and exploring new fashion designers.",
                    description: "Understanding the individual's passions helps in creating a well-rounded CV."
                },
                {
                    key: "field_of_study",
                    question: "What's your primary field of study?",
                    label: "Detail your current progress or if you've already completed it.",
                    example: "I'm currently studying marketing and communications at UPC University. I've completed two out of five years. I chose this field because marketing is closely tied to luxury brands, which aligns with my interests in fashion and styling.",
                    description: "Establishing academic background is crucial for tailoring the CV."
                },
                {
                    key: "motivation",
                    question: "What inspired your choice of field or career?",
                    label: "How it meets your interests and aspirations, even if it's not your main passion?",
                    example: "I chose marketing and communications because it offers opportunities to work with luxury brands, even though my true passion lies in fashion and styling. I believe this field will allow me to merge my interests and skills effectively.",
                    description: "This question delves into the individual's motivations behind their chosen field or career path."
                },
            ]
        },
        {
            key: "tab.skills",
            label: "2. Skills",
            questions: [
                {
                    key: "studies",
                    question: "What, when and where did you study?",
                    label: "Your University, School and other Institutions you were studying.",
                    example: "I'm currently studying Marketing and Comunications at UPC University since January 2021, I've also studied at Lima Fashion Academy last year 2023 from January to August and I finished High School at Veritas High School in 2020.",
                    description: "Your academic background will be hightlighted in the CV."

                },

                {
                    key: "skills",
                    question: "What skills or strengths are your strongest assets?",
                    label: "Your skills, abilities, or subjects that you excel.",
                    example: "I believe my creativity, communication skills, and ability to understand customer needs are my strongest assets. These skills are valuable in marketing, fashion, and styling.",
                    description: "Identifying strongest skills guides CV creation."

                },

                {
                    key: "languages",
                    question: "What languages do you speak?",
                    label: "Languages and Proficiency Level",
                    example: "I speak English fluently and have an intermediate level in French. I'm working on improving my French skills to become fluent.",
                    description: "Proficiency in spoken languages is valuable."
                },
            ]
        },
        {
            key: "tab.experience",
            label: "3. Experience",
            questions: [
                {
                    key: "experience",
                    question: "Can you describe any internships, part-time jobs, or volunteer experiences you've had?",
                    label: "How have these experiences influenced your skills and professional growth, regardless of their direct relation to your interests?",
                    example: "I've worked in telemarketing, served at a café, and freelanced as a designer and personal stylist. These roles have improved my communication skills, customer service, and creative abilities.",
                    description: "Internships and other experiences offer valuable skill development."
                },
                {
                    key: "activities",
                    question: "Have you been involved in any extracurricular activities, clubs, or projects outside of your academic or professional pursuits?",
                    label: "How have these activities contributed to your skill set and personal development, regardless of their direct relation to your studies or work?",
                    example: "I've been part of the fashion club at school and collaborated on styling projects. These experiences have honed my eye for aesthetics and teamwork skills.",
                    description: "Extracurricular involvement demonstrates a well-rounded profile."
                },
            ]
        },
        {
            key: "tab.finish",
            label: "4. Finish",
            questions: [
                {
                    key: "envision",
                    question: "How do you envision your career path evolving in the next few years?",
                    label: "What are your long term goals?",
                    example: "I see myself working in marketing for a luxury fashion brand. To achieve this, I'm networking, gaining relevant experience, and furthering my education in marketing and fashion.",
                    description: "Understanding career aspirations guides CV alignment."

                },

                {
                    key: "references",
                    question: "Do you have personal contacts who can reference you?",
                    label: "Contact information from your network who can talk well about you.",
                    example: "My last boss was Jhon Cooper, the owner of Limabar Coffeshop, his phone is +51987654321, email limabar.coffe@gmail.com and also the Director of Veritas School, Jhon Doe, jdoe@veritas.edu.pe contact at +51232323543. Also, the UPC Counselor, Vivian Mayer, her phone is +51998877665 and mail vmayer@upc.edu.pe",
                    description: "Your network is important for recruiters."

                },
            ]
        },
    ];

    const goPrev = () => {
        setSelectedTab(
            selectedTab === 'tab.finish' ? 'tab.experience' :
                selectedTab === 'tab.experience' ? 'tab.skills' :
                    'tab.you'
        );
    }

    const goNext = () => {
        setSelectedTab(
            selectedTab === 'tab.you' ? 'tab.skills' :
                selectedTab === 'tab.skills' ? 'tab.experience' :
                    'tab.finish'
        );
    }


    async function fetchUserProfile() {
        console.log("fetchUserProfile");
        try {
            const firestore = getFirestore();
            const userDocRef = doc(firestore, "users", user.uid);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                setUserData(userData);
                //console.log("userData",userData);
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
    }, [])

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUserData((prevUserData) => ({
            ...prevUserData,
            [name]: value,
        }));
    };

    return (
        <>
            <div className="container mx-auto px-4 py-4 ">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">Create a CV from Scratch</h1>
                </div>

                <div className="flex flex-col items-center">
                    <div className="my-4 topic-title-blue">Step 1: Please review the following information, it's going to be used for generate your CV.</div>

                    <div className="flex flex-col md:flex-row gap-4">

                        <div className='w-full m-1 rounded-xl'>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full md:w-auto">

                                <Input
                                    type="text"
                                    name="firstName"
                                    label="First Name"
                                    isRequired={true}
                                    value={userData?.firstName}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    variant="underlined"
                                />
                                <Input
                                    type="text"
                                    name="lastName"
                                    label="Last Name"
                                    isRequired={true}
                                    value={userData?.lastName}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    variant="underlined"
                                />
                                <Input
                                    type="text"
                                    name="email"
                                    label="Email"
                                    isRequired={true}
                                    value={userData?.email}
                                    onChange={handleInputChange}
                                    className="w-full md:col-span-2"
                                    variant="underlined"
                                />
                                <Input
                                    type="text"
                                    name="telephoneNumber"
                                    label="Phone"
                                    isRequired={true}
                                    value={userData?.telephoneNumber}
                                    onChange={handleInputChange}
                                    className="w-full md:col-span-2"
                                    variant="underlined"
                                />

                            </div>
                        </div>
                        <div className='w-full m-1 rounded-xl'>
                            <Textarea
                                name="about"
                                label="About"
                                isRequired={true}
                                value={userData?.about}
                                onChange={handleInputChange}
                                className="w-full col-span-2"
                                variant="underlined" />
                        </div>
                        <div className='w-full m-1 rounded-xl'>
                            {socialLinks.map(({ name, baseUrl }) => (
                                <Input
                                    type="text"
                                    name={name}
                                    isRequired={false}
                                    value={userData?.[name]}
                                    onChange={handleInputChange}
                                    startContent={
                                        <>
                                            <img src={`/assets/svg/${name}.svg`} width={20} className='mr-1' />
                                            <span className="text-default-400 text-sm">{baseUrl}</span>
                                        </>
                                    }
                                    className="w-full"
                                    variant="underlined" />

                            ))}
                        </div>
                    </div>
                </div>







                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col items-center">
                    <div className="my-4 topic-title-blue">Step Two: Please answer the following questions. Be honest and as detailed as you can. The more information you provide, the better our AI will be able to structure your information.</div>

                        <Tabs
                            selectedKey={selectedTab}
                            onSelectionChange={handleTabChange}>
                            {tabs.map((item) => (
                                <Tab key={item.key} title={item.label} className='w-full'>
                                    <Card>
                                        <CardBody >
                                            <div className="flex flex-col md:flex-row gap-4">
                                                {item.questions.map((question) => (
                                                    <div key={`div.${question.key}`} className='w-full m-1 rounded-xl'>
                                                        <div className='topic-title-orange text-start text-md'>
                                                            {question.question}
                                                        </div>
                                                        <Textarea
                                                            isRequired
                                                            isDisabled={isProcessing}
                                                            key={question.key}
                                                            label={question.label}
                                                            labelPlacement='outside'
                                                            description={question.description}
                                                            placeholder={`Example: ${question.example}`}
                                                            autoFocus={focusedTextarea === question.key}
                                                            value={answers[question.key]}
                                                            //value={question.example}
                                                            onChange={handleTextareaChange(question.key)}
                                                            classNames={{
                                                                input: "resize-y text-sm font-light",
                                                                description: "italic text-end"
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className='w-full grid grid-cols-2'>
                                                <div className='w-full text-start'>
                                                    {(item.key != "tab.you") ?
                                                        <Button isDisabled={isProcessing} onClick={goPrev} className="appBlackOnCitrine m-4">
                                                            Previous
                                                        </Button>
                                                        : <></>}
                                                </div>
                                                <div className='w-full text-end'>
                                                    <Button isLoading={isProcessing} onClick={(item.key === "tab.finish") ? handleSubmit : goNext} className="appBlackOnCitrine m-4">
                                                        {(item.key === "tab.finish") ? 'Create CV' : 'Next'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Tab>
                            ))}
                        </Tabs>

                    </div>
                </form>
            </div>
        </>
    )
}

export default withProtected(Scratch)