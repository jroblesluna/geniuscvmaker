import { useEffect, useState, useRef } from 'react';
import { Input, Textarea } from '@nextui-org/react';
import { getFirestore, doc, getDoc, DocumentData, updateDoc } from 'firebase/firestore';
import SvgEdit from '../components/svgEdit';
import SvgCheck from '../components/svgCheck';
import SvgCancel from '../components/svgCancel';
import LoadingScreen from '../components/loadingScreen';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import {
  CountryDropdown,
  RegionDropdown,
  CountryRegionData,
} from 'react-country-region-selector';
import { toast } from 'react-hot-toast';
import { withProtected } from '../hook/route';

const socialLinks = [
  { name: 'facebook', baseUrl: 'https://facebook.com/' },
  { name: 'instagram', baseUrl: 'https://instagram.com/' },
  { name: 'linkedin', baseUrl: 'https://linkedin.com/in/' },
  { name: 'tiktok', baseUrl: 'https://tiktok.com/@' },
  { name: 'youtube', baseUrl: 'https://youtube.com/@' },
  { name: 'github', baseUrl: 'https://github.com/' },
];

function Profile({ auth }) {
  const { user, setUser, logout } = auth;
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [originalUserData, setOriginalUserData] = useState<DocumentData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editableFields, setEditableFields] = useState({
    displayName: false,
    lastName: false,
    firstName: false,
  });
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [exhausted, setExhausted] = useState(false);
  const inputRefs = useRef<
    Record<
      string,
      HTMLInputElement | HTMLTextAreaElement | CountryDropdown | RegionDropdown | null
    >
  >({});

  async function fetchUserProfile() {
    console.log('fetchUserProfile');
    try {
      const firestore = getFirestore();
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      console.log('userDocSnapshot', userDocSnapshot);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setUserData(userData);
        setOriginalUserData({ ...userData });
        setProfileLoading(false);
        return true;
      } else {
        console.log("The user document doesn't exist");
        return false;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return false;
    }
  }

  const handleFocus = (event) => {
    event.target.focus();
    event.target.select();
  };

  const handleEditField = (field: string) => {
    setEditableFields({ ...editableFields, [field]: true });
  };

  const handleSaveField = async (field) => {
    try {
      let isValid = true;
      const value = userData?.[field];
      console.log(field, value);
      console.log(field);
      switch (field) {
        case 'firstName':
          if (!/^[^0-9±!@£$%^&*_+§¡€#¢§¶•ªº«\<>-?:;|=.,]{2,50}$/.test(value)) {
            isValid = false;
            toast.error(
              'First name must contain only alphabetic characters and spaces, and be between 2 and 50 characters long'
            );
          }
          break;
        case 'lastName':
          if (!/^[^0-9±!@£$%^&*_+§¡€#¢§¶•ªº«\<>-?:;|=.,]{2,50}$/.test(value)) {
            isValid = false;
            toast.error(
              'Last name must contain only alphabetic characters and spaces, and be between 2 and 50 characters long'
            );
          }
          break;
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            isValid = false;
            toast.error('Invalid email format');
          }
          break;
        case 'telephoneNumber':
          if (!/^\+[0-9]{5,15}$/.test(value)) {
            isValid = false;
            toast.error('Phone number must start with + and be between 5 and 15 digits long');
          }
          break;
        case 'addressStreet':
          if (value.length < 5 || value.length > 100) {
            isValid = false;
            toast.error('Address Street must be between 5 and 100 characters long');
          }
          break;
        case 'addressCity':
          if (value.length < 2 || value.length > 30) {
            isValid = false;
            toast.error('Address City name must be between 2 and 30 characters long');
          }
          break;
      }
      console.log('isValid', isValid);
      if (isValid) {
        const firestore = getFirestore();
        const userDocRef = doc(firestore, 'users', user.uid);
        if (field === 'addressState') {
          await updateDoc(userDocRef, {
            ['addressCountry']: userData?.['addressCountry'],
            ['addressCountryCode']: CountryRegionData.find(
              (data) => data[0] === userData?.['addressCountry']
            )?.[1],
            [field]: userData?.[field],
          });
        } else {
          await updateDoc(userDocRef, { [field]: userData?.[field] });
        }
        setEditableFields({ ...editableFields, [field]: false });
        // Update userData state with the newly saved value
        setOriginalUserData((prevUserData) => ({
          ...prevUserData,
          [field]: userData?.[field],
        }));
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const handleCancelEdit = (field: string) => {
    if (field === 'addressState') {
      setUserData((prevUserData) => ({
        ...prevUserData,
        ['addressCountry']: originalUserData?.['addressCountry'],
      }));
    }
    setUserData((prevUserData) => ({ ...prevUserData, [field]: originalUserData?.[field] }));
    setEditableFields({ ...editableFields, [field]: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const { value } = e.target;
    setUserData((prevUserData) => ({ ...prevUserData, [field]: value }));
  };

  const handleInputStringChange = (value: string, field: string) => {
    setUserData((prevUserData) => ({ ...prevUserData, [field]: value }));
    if (field === 'addressCountry') {
      let newAddressStateValue = CountryRegionData.find(
        (data) => data[0] === value
      )?.[2].split(/[~|]/)[0];
      setUserData((prevUserData) => ({
        ...prevUserData,
        ['addressState']: newAddressStateValue,
      }));
    }
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
              {(() => {
                console.log('switch field', field);
                switch (field) {
                  case 'telephoneNumber':
                    return (
                      <PhoneInput
                        ref={(element) => {
                          if (element) {
                            inputRefs.current[field] = element;
                          }
                        }}
                        autoFocus
                        value={userData[field]}
                        onChange={(phone) => handleInputStringChange(phone, field)}
                        onFocus={handleFocus}
                        className="w-full mt-1 mr-2"
                        inputClassName="w-full"
                      />
                    );
                  case 'about':
                    return (
                      <Textarea
                        ref={(element) => {
                          if (element) {
                            inputRefs.current[field] = element;
                          }
                        }}
                        autoFocus
                        value={userData[field]}
                        onChange={(e) => handleChange(e, field)}
                        onKeyDown={(e) => handleKeyDown(e, field)}
                        onFocus={handleFocus}
                        className="w-full mr-2"
                        variant="flat"
                      />
                    );
                  case 'facebook':
                  case 'instagram':
                  case 'linkedin':
                  case 'tiktok':
                  case 'youtube':
                  case 'github':
                    return (
                      <Input
                        type="text"
                        ref={(element) => {
                          if (element) {
                            inputRefs.current[field] = element;
                          }
                        }}
                        autoFocus
                        value={userData[field]}
                        onChange={(e) => handleChange(e, field)}
                        onKeyDown={(e) => handleKeyDown(e, field)}
                        onFocus={handleFocus}
                        startContent={
                          <>
                            <img
                              src={`/assets/svg/${field}.svg`}
                              width={20}
                              className="mr-1"
                            />
                            <span className="text-default-400 text-sm">
                              {socialLinks.find((link) => link.name === field)?.baseUrl ||
                                null}
                            </span>
                          </>
                        }
                        className="w-full mr-2"
                      />
                    );
                  default:
                    return (
                      <Input
                        type="text"
                        ref={(element) => {
                          if (element) {
                            inputRefs.current[field] = element;
                          }
                        }}
                        autoFocus
                        value={userData[field]}
                        onChange={(e) => handleChange(e, field)}
                        onKeyDown={(e) => handleKeyDown(e, field)}
                        onFocus={handleFocus}
                        className="w-full mr-2"
                      />
                    );
                }
              })()}
              <button onClick={() => handleSaveField(field)} className="text-green-500">
                <SvgCheck />
              </button>
              <button onClick={() => handleCancelEdit(field)} className="text-red-500">
                <SvgCancel />
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              {(() => {
                switch (field) {
                  case 'facebook':
                  case 'instagram':
                  case 'linkedin':
                  case 'tiktok':
                  case 'youtube':
                  case 'github':
                    return (
                      <>
                        <img
                          src={`/assets/svg/${field}.svg`}
                          width={20}
                          className="ml-3 my-2.5 mr-1"
                        />
                        <span className="text-default-400 text-small">
                          {socialLinks.find((link) => link.name === field)?.baseUrl || null}
                        </span>
                      </>
                    );
                }
              })()}
              <span className="mr-4 py-2 w-full">{userData[field]}</span>
              <button onClick={() => handleEditField(field)} className="topic-title-blue">
                <SvgEdit />
              </button>
            </div>
          )}
        </div>
      );
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Función para realizar la lógica de manejo de intentos y ejecución de fetchUserProfile
    const handleFetchUserProfile = async () => {
      if (!userData && !exhausted) {
        const fetchResult = fetchUserProfile();
        if (await fetchResult) {
          clearInterval(intervalId);
          setRemainingAttempts(0);
          setExhausted(true);
        } else {
          setRemainingAttempts((prevAttempts) => {
            const updatedAttempts = prevAttempts - 1;
            if (updatedAttempts <= 0) {
              clearInterval(intervalId);
              setExhausted(true);
              setUser(null);
            }
            return updatedAttempts;
          });
        }
      }
    };

    // Ejecutar la lógica inicialmente
    handleFetchUserProfile();

    // Establecer intervalo para la lógica de manejo de intentos
    intervalId = setInterval(handleFetchUserProfile, 5000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []); // No hay dependencias para asegurar que solo se ejecute una vez

  useEffect(() => {
    console.log(user.uid);
  }, []);
  return (
    <>
      {!profileLoading && userData && user ? (
        <div className="container mx-auto px-4 py-4 max-w-lg lg:max-w-[70%] ">
          <div className="  text-center lg:text-start  mb-8 ">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{userData.displayName}</h1>
            <img
              src={userData.photoURL}
              className="mx-auto lg:mx-0 rounded-full w-24 h-24"
              alt="User Profile"
            />
          </div>
          <div className="text-left lg:w-full lg:grid lg:grid-cols-2 lg:gap-x-10   ">
            <div className="mb-4 lg:-mt-6">
              <p className="font-bold block  lg:hidden">Email:</p>
              <span>{userData.email}</span>
            </div>
            <div className="hidden lg:block">{''}</div>

            {renderEditableField('displayName', 'Display Name')}
            {renderEditableField('about', 'About You')}
            {renderEditableField('lastName', 'Last Name')}
            {renderEditableField('firstName', 'First Name')}
            {renderEditableField('telephoneNumber', 'Telephone Number')}
            {renderEditableField('addressStreet', 'Address')}
            {renderEditableField('addressCity', 'City')}
            <div className="mb-4">
              <p className="font-bold">Country and Region:</p>
              {editableFields['addressState'] ? (
                <div className="mb-4">
                  <div className="flex items-center">
                    <div className="grid grid-cols-1 gap-2 w-full mt-1 mr-2">
                      <CountryDropdown
                        ref={(element) => {
                          if (element) {
                            inputRefs.current['addressCountry'] = element;
                          }
                        }}
                        showDefaultOption={false}
                        value={userData['addressCountry']}
                        onChange={(e) => handleInputStringChange(e, 'addressCountry')}
                        classes="w-full h-10 bg-gray-100 rounded-xl px-2"
                      />
                      <RegionDropdown
                        ref={(element) => {
                          if (element) {
                            inputRefs.current['addressState'] = element;
                          }
                        }}
                        //showDefaultOption={false}
                        country={userData['addressCountry']}
                        value={userData['addressState']}
                        onChange={(e) => handleInputStringChange(e, 'addressState')}
                        classes="w-full h-10 bg-gray-100 rounded-xl px-2"
                      />
                    </div>
                    <button
                      onClick={() => handleSaveField('addressState')}
                      className="text-green-500"
                    >
                      <SvgCheck />
                    </button>
                    <button
                      onClick={() => handleCancelEdit('addressState')}
                      className="text-red-500"
                    >
                      <SvgCancel />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="grid grid-cols-1 gap-2 w-full mt-1 mr-2">
                    <span className="mr-4 py-2 w-full">{userData['addressCountry']}</span>
                    <span className="mr-4 py-2 w-full">{userData['addressState']}</span>
                  </div>
                  <button
                    onClick={() => handleEditField('addressState')}
                    className="topic-title-blue"
                  >
                    <SvgEdit />
                  </button>
                </div>
              )}
            </div>
            {renderEditableField('facebook', 'Facebook')}
            {renderEditableField('instagram', 'Instagram')}
            {renderEditableField('linkedin', 'LinkedIn')}
            {renderEditableField('tiktok', 'TikTok')}
            {renderEditableField('youtube', 'Youtube')}
            {renderEditableField('github', 'Github')}
            <div className="mb-4 text-xs text-center block lg:hidden">
              <p className="font-light">
                Google UID: <span>{user.uid}</span>
              </p>
              <p className="font-light">
                Culqi ID: <span>{userData['culqiCustomerId']}</span>
              </p>
            </div>
          </div>

          <div className="mb-4 text-xs text-center hidden lg:block">
            <p className="font-light">
              Google UID: <span>{user.uid}</span>
            </p>
            <p className="font-light">
              Culqi ID: <span>{userData['culqiCustomerId']}</span>
            </p>
          </div>
        </div>
      ) : (
        <LoadingScreen />
      )}
    </>
  );
}

export default withProtected(Profile);
