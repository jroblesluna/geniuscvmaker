import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, DocumentData, updateDoc } from "firebase/firestore";
import SvgEdit from "../components/svgEdit";
import { withProtected } from '../hook/route';
import LoadingScreen from '../components/loadingScreen';
import SvgCheck from '../components/svgCheck';
import SvgCancel from '../components/svgCancel';

function Profile({ auth }) {
    const { user } = auth;
    const [userData, setUserData] = useState<DocumentData | null>(null);
    const [originalUserData, setOriginalUserData] = useState<DocumentData | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [editableFields, setEditableFields] = useState({
        displayName: false,
        family_name: false,
        given_name: false
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                console.log("4. Try del fetchUserProfile");
                const firestore = getFirestore();
                const userDocRef = doc(firestore, "users", user.uid);
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    console.log("5. if userDocSnapshot exists");
                    const userData = userDocSnapshot.data();
                    setUserData(userData);
                    setOriginalUserData({ ...userData });
                } else {
                    console.log("6. No userDocSnapshot exists");
                    console.log("El documento del usuario no existe aún");
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                console.log("7. profileLoading set False");
                setProfileLoading(false);
            }
        };
    
        const fetchData = async () => {
            console.log("2. profileLoading", profileLoading);
            // Verificar si userData no está definido o si profileLoading es verdadero
            if (!userData || profileLoading) {
                console.log("3. fetchUserProfile");
                await fetchUserProfile();
            }
        };
    
        if (user) {
            console.log("1. user");
            fetchData();
        }
    }, [user, userData, profileLoading]);

    const handleEditField = (field: string) => {
        setEditableFields({ ...editableFields, [field]: true });
    };

    const handleSaveField = async (field: string) => {
        try {
                const firestore = getFirestore();
                const userDocRef = doc(firestore, "users", user.uid);
                await updateDoc(userDocRef, { [field]: userData?.[field] });
                setEditableFields({ ...editableFields, [field]: false });
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
    };

    const handleCancelEdit = (field: string) => {
        setUserData((prevUserData) => ({ ...prevUserData, [field]: originalUserData?.[field] }));
        setEditableFields({ ...editableFields, [field]: false });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const { value } = e.target;
        setUserData((prevUserData) => ({ ...prevUserData, [field]: value }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: string) => {
        if (e.key === 'Enter') {
            handleSaveField(field);
        } else if (e.key === 'Escape') {
            handleCancelEdit(field);
        }
    };    
        
    const renderEditableField = (field: string, label: string) => {
        if (userData) {
            return (
                <div className="mb-4">
                    <p className="font-bold">{label}:</p>
                    {editableFields[field] ? (
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={userData[field]}
                                onChange={(e) => handleChange(e, field)}
                                onKeyDown={(e) => handleKeyDown(e, field)}
                                className="border border-gray-300 px-2 py-1 rounded-md"
                            />
                            <button onClick={() => handleSaveField(field)} className="text-green-500"><SvgCheck /></button>
                            <button onClick={() => handleCancelEdit(field)} className="text-red-500"><SvgCancel /></button>
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <span className="mr-2">{userData[field]}</span>
                            <button onClick={() => handleEditField(field)} className="topic-title-blue"><SvgEdit /></button>
                        </div>
                    )}
                </div>
            )
        };
    };


    return (
        <>
            {profileLoading || !userData ? (
                <LoadingScreen />
            ) : (
                <div className="container mx-auto px-4 py-8 max-w-lg mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">{userData.displayName}</h1>
                        <img src={userData.photoURL} className="mx-auto rounded-full w-24 h-24" alt="User Profile" />
                    </div>
                    <div className="text-left">
                        <div className="mb-4">
                            <p className="font-bold">Email:</p>
                            <span>{userData.email}</span>
                        </div>

                        {renderEditableField('displayName', 'Display Name')}
                        {renderEditableField('family_name', 'Last Name / Family Name')}
                        {renderEditableField('given_name', 'First Name / Given Name')}
                        <div className="mb-4">
                            <p className="font-bold">User UID:</p>
                            <span>{user.uid}</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default withProtected(Profile);
