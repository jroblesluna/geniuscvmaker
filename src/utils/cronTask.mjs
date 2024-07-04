import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
export const degrees = [
  { key: "associate", label: "Associate" },
  { key: "bachelor", label: "Bachelor's, (BSc)" },
  { key: "master", label: "Master's (MSc)" },
  { key: "phd", label: "Post-Doctorate (Ph.D.)" },
  { key: "professional", label: "Professional (M.D., J.D.)" },
  { key: "other", label: "Other" },
]

export const languagesList = [
  { key: "af", label: "Afrikaans" },
  { key: "am", label: "Amharic" },
  { key: "ar", label: "Arabic" },
  { key: "bn", label: "Bengali" },
  { key: "bg", label: "Bulgarian" },
  { key: "my", label: "Burmese" },
  { key: "ca", label: "Catalan" },
  { key: "zh", label: "Mandarin Chinese" },
  { key: "hr", label: "Croatian" },
  { key: "cs", label: "Czech" },
  { key: "da", label: "Danish" },
  { key: "nl", label: "Dutch" },
  { key: "en", label: "English" },
  { key: "et", label: "Estonian" },
  { key: "fa", label: "Persian" },
  { key: "fi", label: "Finnish" },
  { key: "fr", label: "French" },
  { key: "ka", label: "Georgian" },
  { key: "de", label: "German" },
  { key: "el", label: "Greek" },
  { key: "gu", label: "Gujarati" },
  { key: "hi", label: "Hindi" },
  { key: "hu", label: "Hungarian" },
  { key: "is", label: "Icelandic" },
  { key: "id", label: "Indonesian" },
  { key: "it", label: "Italian" },
  { key: "ja", label: "Japanese" },
  { key: "jv", label: "Javanese" },
  { key: "kn", label: "Kannada" },
  { key: "ko", label: "Korean" },
  { key: "lv", label: "Latvian" },
  { key: "lt", label: "Lithuanian" },
  { key: "mr", label: "Marathi" },
  { key: "ms", label: "Malay" },
  { key: "pa", label: "Punjabi" },
  { key: "pl", label: "Polish" },
  { key: "pt", label: "Portuguese" },
  { key: "ro", label: "Romanian" },
  { key: "ru", label: "Russian" },
  { key: "sr", label: "Serbian" },
  { key: "es", label: "Spanish" },
  { key: "sv", label: "Swedish" },
  { key: "ta", label: "Tamil" },
  { key: "te", label: "Telugu" },
  { key: "th", label: "Thai" },
  { key: "tr", label: "Turkish" },
  { key: "ur", label: "Urdu" },
  { key: "vi", label: "Vietnamese" }
];

export const proficiencyLevels = [
  { key: "A1", label: "Beginner" },
  { key: "A2", label: "Elementary" },
  { key: "B1", label: "Intermediate" },
  { key: "B2", label: "Upper Intermediate" },
  { key: "C1", label: "Advanced" },
  { key: "C2", label: "Proficient" }
];

export const socialLinks = [
  { name: 'facebook', baseUrl: 'https://facebook.com/' },
  { name: 'instagram', baseUrl: 'https://instagram.com/' },
  { name: 'linkedin', baseUrl: 'https://linkedin.com/in/' },
  { name: 'tiktok', baseUrl: 'https://tiktok.com/@' },
  { name: 'youtube', baseUrl: 'https://youtube.com/@' },
  { name: 'github', baseUrl: 'https://github.com/' },
];

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

initializeApp(firebaseConfig);

const scratchQuestions = {
  field_of_study: 'What\'s your primary field of study?',
  skills: 'What skills or strengths are your strongest assets?',
  passion: 'What are you passionate about?',
  activities: 'Have you been involved in any extracurricular activities, clubs, or projects outside of your academic or professional pursuits?',
  references: 'Do you have personal contacts who can reference you?',
  studies: 'What, when and where did you study?',
  experience: 'Can you describe any internships, part-time jobs, or volunteer experiences you\'ve had?',
  languages: 'What languages do you speak?',
  envision: 'How do you envision your career path evolving in the next few years?',
  motivation: 'What inspired your choice of field or career?'
};

const now = new Date();
const formattedDate = now.toLocaleString();
console.log(`Start Date and Time: ${formattedDate}`);

const firestore = getFirestore();
const tasksCollection = collection(firestore, 'tasks');
console.log("tasksCollection",tasksCollection);
const querySnapshot = await getDocs(query(tasksCollection, where('status', '==', 0)));

for (const taskDoc of querySnapshot.docs) {
  const taskData = taskDoc.data();
  console.log('taskDoc.id', taskDoc.id);

  if (taskData.requestPath) {
    console.log('taskData.requestPath', taskData.requestPath);
    const taskDocumentRef = doc(firestore, taskData.requestPath);
    const taskDocument = await getDoc(taskDocumentRef);

    if (taskDocument.exists()) {
      //console.log("taskDocument.data()", taskDocument.data());
      const pendingTaskData = taskDocument.data();
      let firstName = pendingTaskData.firstName;
      let lastName = pendingTaskData.lastName;
      let email = pendingTaskData.email;
      let telephoneNumber = pendingTaskData.telephoneNumber;
      let about = pendingTaskData.about;
      let facebook = pendingTaskData.facebook;
      let instagram = pendingTaskData.instagram;
      let linkedin = pendingTaskData.linkedin;
      let tiktok = pendingTaskData.tiktok;
      let youtube = pendingTaskData.youtube;
      let github = pendingTaskData.github;

      let geniusCommand = 'Your task is to build a CV for a professional following these steps:\n';
      geniusCommand += 'Step 1: Consider the Personal Information for this professional, contained between triple backticks:\n';
      geniusCommand += '```START OF PERSONAL INFORMATION\n';
      geniusCommand += 'First Name: ' + firstName + '\n';
      geniusCommand += 'Last Name: ' + lastName + '\n';
      geniusCommand += 'Email: ' + email + '\n';
      if (telephoneNumber) { geniusCommand += 'Telephone number: ' + telephoneNumber + '\n' };
      if (about) { geniusCommand += 'Profile: ' + about + '\n' };
      if (facebook) { geniusCommand += 'Facebook ID: ' + facebook + ' URL: ' + socialLinks.find(link => link.name === "facebook").baseUrl + facebook + '\n' };
      if (instagram) { geniusCommand += 'Instagram ID: ' + instagram + ' URL: ' + socialLinks.find(link => link.name === "instagram").baseUrl + instagram + '\n' };
      if (linkedin) { geniusCommand += 'LinkedIn ID: ' + linkedin + ' URL: ' + socialLinks.find(link => link.name === "linkedin").baseUrl + linkedin + '\n' };
      if (tiktok) { geniusCommand += 'TikTok ID: ' + tiktok + ' URL: ' + socialLinks.find(link => link.name === "tiktok").baseUrl + tiktok + '\n' };
      if (youtube) { geniusCommand += 'Youtube ID: ' + youtube + ' URL: ' + socialLinks.find(link => link.name === "youtube").baseUrl + youtube + '\n' };
      if (github) { geniusCommand += 'Github ID: ' + github + ' URL: ' + socialLinks.find(link => link.name === "github").baseUrl + github + '\n' };
      geniusCommand += 'END OF PERSONAL INFORMATION```\n';

      const cvInputData = pendingTaskData.geniusBody;

      switch (pendingTaskData.geniusApp) {
        case 'scratch':
          let scratchInterview = '';
          scratchInterview += "Question: " + scratchQuestions.passion + "\nAnswer: " + cvInputData.passion + "\n";
          scratchInterview += "Question: " + scratchQuestions.envision + "\nAnswer: " + cvInputData.envision + "\n";
          scratchInterview += "Question: " + scratchQuestions.field_of_study + "\nAnswer: " + cvInputData.field_of_study + "\n";
          scratchInterview += "Question: " + scratchQuestions.motivation + "\nAnswer: " + cvInputData.motivation + "\n";
          scratchInterview += "Question: " + scratchQuestions.studies + "\nAnswer: " + cvInputData.studies + "\n";
          scratchInterview += "Question: " + scratchQuestions.skills + "\nAnswer: " + cvInputData.skills + "\n";
          scratchInterview += "Question: " + scratchQuestions.experience + "\nAnswer: " + cvInputData.experience + "\n";
          scratchInterview += "Question: " + scratchQuestions.activities + "\nAnswer: " + cvInputData.activities + "\n";
          scratchInterview += "Question: " + scratchQuestions.languages + "\nAnswer: " + cvInputData.languages + "\n";
          scratchInterview += "Question: " + scratchQuestions.references + "\nAnswer: " + cvInputData.references + "\n";

          geniusCommand += 'Step 2: Consider the following INTERVIEW to build the CV\n';
          geniusCommand += '```START OF INTERVIEW\n';

          geniusCommand += scratchInterview;

          geniusCommand += 'END OF INTERVIEW```\n';
          geniusCommand += 'Step 3: Enhance the Profile from PERSONAL INFORMATION using INTERVIEW.\n';
          break;
        case 'craft':
          // Implement 'craft' case handling here
          let craftData = '';

          craftData += 'SECTION: WORK EXPERIENCES\n'; // Corrected the initial value
          cvInputData.workExperiences.map((workExperience, index) => {
            craftData += `Work Experience #${index + 1}:\n`;  // Add enumeration
            workExperience.companyName && (craftData += 'I worked for the company ' + workExperience.companyName + '\n');
            workExperience.position && (craftData += 'My position or role was ' + workExperience.position + '\n');
            workExperience.dateFrom && (craftData += 'I started working from ' + workExperience.dateFrom + '\n');
            workExperience.dateTo && !(workExperience.current) && (craftData += 'I worked until' + workExperience.dateTo + '\n');
            workExperience.achievements && (craftData += 'My achievements were: ' + workExperience.achievements + '\n');
          });

          craftData += 'SECTION: LICENSES\n'; // Corrected the initial value
          cvInputData.licenses.map((license, index) => {
            craftData += `License #${index + 1}:\n`;  // Add enumeration
            license.title && (craftData += 'I have a professional license as ' + license.title + '\n');
            license.degree && license.degree !== 'other' && (craftData += 'My Degree is ' + degrees.find(degree => degree.key === license.degree).label + '\n');
            license.institution && (craftData += 'The issuer of the license was ' + license.institution + '\n');
            license.achieved && (craftData += 'I achieved it on ' + license.achieved + '\n');
          });

          craftData += 'SECTION: CERTIFICATIONS\n'; // Corrected the initial value
          cvInputData.certifications.map((certification, index) => {
            craftData += `Certification #${index + 1}:\n`;  // Add enumeration
            certification.title && (craftData += 'I\'m certified as ' + certification.title + '\n');
            certification.institution && (craftData += 'The issuer of the certification was ' + certification.institution + '\n');
            certification.achieved && (craftData += 'I achieved it on ' + certification.achieved + '\n');
            certification.expiration && !(certification.perpetual) && (craftData += 'It expires on ' + certification.expiration + '\n');
            certification.certificationID && (craftData += 'My Certification ID is ' + certification.certificationID + '\n');
            certification.certificationURL && (craftData += 'The Certificate URL is ' + certification.certificationURL + '\n');
          });

          craftData += 'SECTION: SKILLS\n'; // Corrected the initial value
          craftData += 'I\'m skilled in: '; // Corrected the initial value
          cvInputData.skills.map((skill) => {
            skill.skillName && (craftData += skill.skillName + ', ');
          });
          craftData += '\n';


          craftData += 'SECTION: LANGUAGES\n'; // Corrected the initial value
          cvInputData.languages.map((language, index) => {
            craftData += `Language #${index + 1}: `;  // Add enumeration
            language.language && (craftData += 'I can speak ' + languagesList.find(languageItem => languageItem.key === language.language).label + ', ');
            language.proficiencyLevel && (craftData += 'my proficiency level is ' + proficiencyLevels.find(proficiencyLevel => proficiencyLevel.key === language.proficiencyLevel).label + '\n');
          });

          craftData += 'SECTION: PERSONAL REFERENCES\n'; // Corrected the initial value
          cvInputData.personalReferences.map((personalReference, index) => {
            craftData += `Reference #${index + 1}: `;  // Add enumeration
            personalReference.name && (craftData += personalReference.name + ', ');
            personalReference.institution && (craftData += personalReference.institution + ', ');
            personalReference.position && (craftData += personalReference.position + ', ');
            personalReference.email && (craftData += personalReference.email + ', ');
            personalReference.telephoneNumber && (craftData += personalReference.telephoneNumber + '\n');
          });

          geniusCommand += 'Step 2: Consider the following CRAFTING_DATA to build the CV\n';
          geniusCommand += '```START OF CRAFTING_DATA\n';

          geniusCommand += craftData;

          geniusCommand += 'END OF CRAFTING_DATA```\n';
          geniusCommand += 'Step 3: Enhance the Profile from PERSONAL INFORMATION using CRAFTING_DATA\n';



          break;
        case 'optimize':
          // Implement 'optimize' case handling here
          break;
        case 'spotlight':
          // Implement 'spotlight' case handling here
          break;
      }
      geniusCommand += 'Step 4: Generate a new CV using the provided information in previous steps, emphasizing skills and organizing it into sections such as Professional Summary, Goals and Objectives, Education, Skills, Experience, Extracurricular Activities, Languages, and References. You may add or modify sections to enhance professionalism. Arrange each section\'s content from latest to earliest when applicable, and remove any empty or irrelevant sections. Optimize content for readability, eliminating redundant or obvious text.\n';
      geniusCommand += 'Step 5: Ensure the Professional Summary of the new CV section is succinct, non-redundant, and short but professional enough.\n';
      geniusCommand += 'Step 6: Format this new CV in HTML starting from a <div> tag. Use the Name as the title, with elegant inline CSS styling within a <style> tag without modifying the style of .container or primary tags like body, p, h1, h2, h3. h4, h5 and h6. Avoid large font sizes.\n';
      //geniusCommand += 'Utilize <ul> and <li> tags for bullet items within each section, and add extra <p> and <br> tags for visual spacing where appropriate.\n';
      //geniusCommand += 'Ensure the HTML is ready for inclusion in a web page.\n';
      geniusCommand += 'Step 7: Ensure your Output is only the HTML within the main <div> tag, with no additional text or comments outside of it.\n';

      try {
        console.log("PROMPT: ", geniusCommand);
        const response = await fetch('http://localhost:3000/api/generate-cv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ geniusPrompt: geniusCommand }),
        });

        const data = await response.json();
        if (data.result) {
          //console.log("data.result", data.result);

          try {
            let dataResult = data.result;
            let divStartIndex = dataResult.indexOf('<div>');
            dataResult = divStartIndex !== -1 ? dataResult.substring(divStartIndex) : dataResult;
            await updateDoc(taskDocumentRef, { geniusResponse: dataResult, status: 'finalized' });
            await updateDoc(taskDoc.ref, { status: 1 });
          } catch (updateError) {
            console.error('Error updating Firestore documents:', updateError);
          } finally {
            console.log('Update process completed.');
          }
        } else {
          console.error(data.error);
        }
      } catch (fetchError) {
        console.error('Error generating CV:', fetchError);
      }

    } else {
      console.log('No such document!');
    }
  } else {
    console.log('No task path found');
  }
}

process.exit(0);
