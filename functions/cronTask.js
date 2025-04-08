import { encode, decode } from 'punycode';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
const URL_BASE = 'https://geniuscvmaker.web.app'; // Cambia esto por tu URL base real
import fetch from 'node-fetch';
import { getStorage } from 'firebase-admin/storage';

console.log('debug');

initializeApp({
  credential: applicationDefault(),
});

const degrees = [
  { key: 'associate', label: 'Associate' },
  { key: 'bachelor', label: "Bachelor's, (BSc)" },
  { key: 'master', label: "Master's (MSc)" },
  { key: 'phd', label: 'Post-Doctorate (Ph.D.)' },
  { key: 'professional', label: 'Professional (M.D., J.D.)' },
  { key: 'other', label: 'Other' },
];

const languagesList = [
  { key: 'af', label: 'Afrikaans' },
  { key: 'am', label: 'Amharic' },
  { key: 'ar', label: 'Arabic' },
  { key: 'bn', label: 'Bengali' },
  { key: 'bg', label: 'Bulgarian' },
  { key: 'my', label: 'Burmese' },
  { key: 'ca', label: 'Catalan' },
  { key: 'zh', label: 'Mandarin Chinese' },
  { key: 'hr', label: 'Croatian' },
  { key: 'cs', label: 'Czech' },
  { key: 'da', label: 'Danish' },
  { key: 'nl', label: 'Dutch' },
  { key: 'en', label: 'English' },
  { key: 'et', label: 'Estonian' },
  { key: 'fa', label: 'Persian' },
  { key: 'fi', label: 'Finnish' },
  { key: 'fr', label: 'French' },
  { key: 'ka', label: 'Georgian' },
  { key: 'de', label: 'German' },
  { key: 'el', label: 'Greek' },
  { key: 'gu', label: 'Gujarati' },
  { key: 'hi', label: 'Hindi' },
  { key: 'hu', label: 'Hungarian' },
  { key: 'is', label: 'Icelandic' },
  { key: 'id', label: 'Indonesian' },
  { key: 'it', label: 'Italian' },
  { key: 'ja', label: 'Japanese' },
  { key: 'jv', label: 'Javanese' },
  { key: 'kn', label: 'Kannada' },
  { key: 'ko', label: 'Korean' },
  { key: 'lv', label: 'Latvian' },
  { key: 'lt', label: 'Lithuanian' },
  { key: 'mr', label: 'Marathi' },
  { key: 'ms', label: 'Malay' },
  { key: 'pa', label: 'Punjabi' },
  { key: 'pl', label: 'Polish' },
  { key: 'pt', label: 'Portuguese' },
  { key: 'ro', label: 'Romanian' },
  { key: 'ru', label: 'Russian' },
  { key: 'sr', label: 'Serbian' },
  { key: 'es', label: 'Spanish' },
  { key: 'sv', label: 'Swedish' },
  { key: 'ta', label: 'Tamil' },
  { key: 'te', label: 'Telugu' },
  { key: 'th', label: 'Thai' },
  { key: 'tr', label: 'Turkish' },
  { key: 'ur', label: 'Urdu' },
  { key: 'vi', label: 'Vietnamese' },
];

const proficiencyLevels = [
  { key: 'A1', label: 'Beginner' },
  { key: 'A2', label: 'Elementary' },
  { key: 'B1', label: 'Intermediate' },
  { key: 'B2', label: 'Upper Intermediate' },
  { key: 'C1', label: 'Advanced' },
  { key: 'C2', label: 'Proficient' },
];

const socialLinks = [
  { name: 'facebook', baseUrl: 'https://facebook.com/' },
  { name: 'instagram', baseUrl: 'https://instagram.com/' },
  { name: 'linkedin', baseUrl: 'https://linkedin.com/in/' },
  { name: 'tiktok', baseUrl: 'https://tiktok.com/@' },
  { name: 'youtube', baseUrl: 'https://youtube.com/@' },
  { name: 'github', baseUrl: 'https://github.com/' },
];
/*
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
*/
//const app = initializeApp(firebaseConfig);

const scratchQuestions = {
  field_of_study: "What's your primary field of study?",
  skills: 'What skills or strengths are your strongest assets?',
  passion: 'What are you passionate about?',
  activities:
    'Have you been involved in any extracurricular activities, clubs, or projects outside of your academic or professional pursuits?',
  references: 'Do you have personal contacts who can reference you?',
  studies: 'What, when and where did you study?',
  experience:
    "Can you describe any internships, part-time jobs, or volunteer experiences you've had?",
  languages: 'What languages do you speak?',
  envision: 'How do you envision your career path evolving in the next few years?',
  motivation: 'What inspired your choice of field or career?',
};

const callPdf = async (pdfUrl) => {
  try {
    const response = await fetch(`${URL_BASE}/api/extract-pdf?url=${pdfUrl}`);

    const data = await response.json();

    if (response.ok) {
      return data.text;
    } else {
      console.error('Error al extraer el PDF:', data.message);
      return 'NOT FOUND';
    }
  } catch (error) {
    console.error('Error en la petición:', error);
    return 'ERROR';
  }
};

const MAX_TOKENS = 3500;

function trimToMaxTokens(text, maxTokens = MAX_TOKENS) {
  const tokens = encode(text);

  if (tokens.length <= maxTokens) {
    return text;
  }

  const trimmedTokens = encode(tokens.slice(0, maxTokens));
  return decode(trimmedTokens);
}

const deleteFileFromUrl = async (fileUrl) => {
  try {
    const storage = getStorage();
    const bucket = storage.bucket('geniuscvmaker.appspot.com');

    const matches = fileUrl.match(/\/o\/(.*?)\?/);
    if (!matches || matches.length < 2) {
      throw new Error('Invalid file URL format');
    }

    const filePath = decodeURIComponent(matches[1]);

    // Crear la referencia al archivo
    const fileRef = bucket.file(filePath);

    // Eliminar el archivo
    await fileRef.delete();
    console.log('File deleted successfully');
    return true;
  } catch (error) {
    console.error('File deletion failed:', error);
    return false;
  }
};

export default async () => {
  const now = new Date();
  const formattedDate = now.toLocaleString();
  console.log(`Start Date and Time: ${formattedDate}`);

  const db = getFirestore(); // Usar Firestore con Admin SDK
  const tasksCollection = db.collection('tasks');
  const LENGUAGE_KEY = 'en';

  const querySnapshot = await tasksCollection.where('status', '==', 0).get();

  for (const taskDoc of querySnapshot.docs) {
    // It should be dinamic
    const taskData = taskDoc.data();
    console.log('taskDoc.id', taskDoc.id);

    if (taskData.requestPath) {
      console.log('taskData.requestPath', taskData.requestPath);
      const taskDocumentRef = db.doc(taskData.requestPath);

      const taskDocument = await taskDocumentRef.get();

      if (taskDocument.exists) {
        const pendingTaskData = taskDocument.data();
        const cvInputData = pendingTaskData.geniusBody;

        let geniusCommand = `Your task is to build a CV in ${
          languagesList.find((lang) => lang.key === LENGUAGE_KEY).label
        } for a professional following these steps:\n`;

        let firstName = '';
        let lastName = '';
        let email = '';
        let telephoneNumber = '';
        let about = '';
        let facebook = '';
        let instagram = '';
        let linkedin = '';
        let tiktok = '';
        let youtube = '';
        let github = '';

        switch (pendingTaskData.geniusApp) {
          case 'scratch':
            firstName = pendingTaskData.firstName;
            lastName = pendingTaskData.lastName;
            email = pendingTaskData.email;
            telephoneNumber = pendingTaskData.telephoneNumber;
            about = pendingTaskData.about;
            facebook = pendingTaskData.facebook;
            instagram = pendingTaskData.instagram;
            linkedin = pendingTaskData.linkedin;
            tiktok = pendingTaskData.tiktok;
            youtube = pendingTaskData.youtube;
            github = pendingTaskData.github;

            geniusCommand +=
              'Step 1: Consider the Personal Information for this professional, contained between triple backticks:\n';
            geniusCommand += '```START OF PERSONAL INFORMATION\n';
            geniusCommand += 'First Name: ' + firstName + '\n';
            geniusCommand += 'Last Name: ' + lastName + '\n';
            geniusCommand += 'Email: ' + email + '\n';
            if (telephoneNumber) {
              geniusCommand += 'Telephone number: ' + telephoneNumber + '\n';
            }
            if (about) {
              geniusCommand += 'Profile: ' + about + '\n';
            }
            if (facebook) {
              geniusCommand +=
                'Facebook ID: ' +
                facebook +
                ' URL: ' +
                socialLinks.find((link) => link.name === 'facebook').baseUrl +
                facebook +
                '\n';
            }
            if (instagram) {
              geniusCommand +=
                'Instagram ID: ' +
                instagram +
                ' URL: ' +
                socialLinks.find((link) => link.name === 'instagram').baseUrl +
                instagram +
                '\n';
            }
            if (linkedin) {
              geniusCommand +=
                'LinkedIn ID: ' +
                linkedin +
                ' URL: ' +
                socialLinks.find((link) => link.name === 'linkedin').baseUrl +
                linkedin +
                '\n';
            }
            if (tiktok) {
              geniusCommand +=
                'TikTok ID: ' +
                tiktok +
                ' URL: ' +
                socialLinks.find((link) => link.name === 'tiktok').baseUrl +
                tiktok +
                '\n';
            }
            if (youtube) {
              geniusCommand +=
                'Youtube ID: ' +
                youtube +
                ' URL: ' +
                socialLinks.find((link) => link.name === 'youtube').baseUrl +
                youtube +
                '\n';
            }
            if (github) {
              geniusCommand +=
                'Github ID: ' +
                github +
                ' URL: ' +
                socialLinks.find((link) => link.name === 'github').baseUrl +
                github +
                '\n';
            }
            geniusCommand += 'END OF PERSONAL INFORMATION```\n';

            let scratchInterview = '';
            scratchInterview +=
              'Question: ' +
              scratchQuestions.passion +
              '\nAnswer: ' +
              cvInputData.passion +
              '\n';
            scratchInterview +=
              'Question: ' +
              scratchQuestions.envision +
              '\nAnswer: ' +
              cvInputData.envision +
              '\n';
            scratchInterview +=
              'Question: ' +
              scratchQuestions.field_of_study +
              '\nAnswer: ' +
              cvInputData.field_of_study +
              '\n';
            scratchInterview +=
              'Question: ' +
              scratchQuestions.motivation +
              '\nAnswer: ' +
              cvInputData.motivation +
              '\n';
            scratchInterview +=
              'Question: ' +
              scratchQuestions.studies +
              '\nAnswer: ' +
              cvInputData.studies +
              '\n';
            scratchInterview +=
              'Question: ' +
              scratchQuestions.skills +
              '\nAnswer: ' +
              cvInputData.skills +
              '\n';
            scratchInterview +=
              'Question: ' +
              scratchQuestions.experience +
              '\nAnswer: ' +
              cvInputData.experience +
              '\n';
            scratchInterview +=
              'Question: ' +
              scratchQuestions.activities +
              '\nAnswer: ' +
              cvInputData.activities +
              '\n';
            scratchInterview +=
              'Question: ' +
              scratchQuestions.languages +
              '\nAnswer: ' +
              cvInputData.languages +
              '\n';
            scratchInterview +=
              'Question: ' +
              scratchQuestions.references +
              '\nAnswer: ' +
              cvInputData.references +
              '\n';

            geniusCommand += 'Step 2: Consider the following INTERVIEW to build the CV\n';
            geniusCommand += '```START OF INTERVIEW\n';

            geniusCommand += scratchInterview;

            geniusCommand += 'END OF INTERVIEW```\n';
            geniusCommand +=
              'Step 3: Enhance the Profile from PERSONAL INFORMATION using INTERVIEW.\n';
            break;
          case 'craft':
            firstName = pendingTaskData.firstName;
            lastName = pendingTaskData.lastName;
            email = pendingTaskData.email;
            telephoneNumber = pendingTaskData.telephoneNumber;
            about = pendingTaskData.about;
            facebook = pendingTaskData.facebook;
            instagram = pendingTaskData.instagram;
            linkedin = pendingTaskData.linkedin;
            tiktok = pendingTaskData.tiktok;
            youtube = pendingTaskData.youtube;
            github = pendingTaskData.github;

            geniusCommand +=
              'Step 1: Consider the Personal Information for this professional, contained between triple backticks:\n';
            geniusCommand += '```START OF PERSONAL INFORMATION\n';
            geniusCommand += 'First Name: ' + firstName + '\n';
            geniusCommand += 'Last Name: ' + lastName + '\n';
            geniusCommand += 'Email: ' + email + '\n';
            if (telephoneNumber) {
              geniusCommand += 'Telephone number: ' + telephoneNumber + '\n';
            }
            if (about) {
              geniusCommand += 'Profile: ' + about + '\n';
            }
            if (facebook) {
              geniusCommand +=
                'Facebook ID: ' +
                facebook +
                ' URL: ' +
                socialLinks.find((link) => link.name === 'facebook').baseUrl +
                facebook +
                '\n';
            }
            if (instagram) {
              geniusCommand +=
                'Instagram ID: ' +
                instagram +
                ' URL: ' +
                socialLinks.find((link) => link.name === 'instagram').baseUrl +
                instagram +
                '\n';
            }
            if (linkedin) {
              geniusCommand +=
                'LinkedIn ID: ' +
                linkedin +
                ' URL: ' +
                socialLinks.find((link) => link.name === 'linkedin').baseUrl +
                linkedin +
                '\n';
            }
            if (tiktok) {
              geniusCommand +=
                'TikTok ID: ' +
                tiktok +
                ' URL: ' +
                socialLinks.find((link) => link.name === 'tiktok').baseUrl +
                tiktok +
                '\n';
            }
            if (youtube) {
              geniusCommand +=
                'Youtube ID: ' +
                youtube +
                ' URL: ' +
                socialLinks.find((link) => link.name === 'youtube').baseUrl +
                youtube +
                '\n';
            }
            if (github) {
              geniusCommand +=
                'Github ID: ' +
                github +
                ' URL: ' +
                socialLinks.find((link) => link.name === 'github').baseUrl +
                github +
                '\n';
            }
            geniusCommand += 'END OF PERSONAL INFORMATION```\n';

            let craftData = '';

            craftData += 'SECTION: WORK EXPERIENCES\n'; // Corrected the initial value
            cvInputData.workExperiences.map((workExperience, index) => {
              craftData += `Work Experience #${index + 1}:\n`; // Add enumeration
              workExperience.companyName &&
                (craftData += 'I worked for the company ' + workExperience.companyName + '\n');
              workExperience.position &&
                (craftData += 'My position or role was ' + workExperience.position + '\n');
              workExperience.dateFrom &&
                (craftData += 'I started working from ' + workExperience.dateFrom + '\n');
              workExperience.dateTo &&
                !workExperience.current &&
                (craftData += 'I worked until' + workExperience.dateTo + '\n');
              workExperience.achievements &&
                (craftData += 'My achievements were: ' + workExperience.achievements + '\n');
            });

            craftData += 'SECTION: LICENSES\n'; // Corrected the initial value
            cvInputData.licenses.map((license, index) => {
              craftData += `License #${index + 1}:\n`; // Add enumeration
              license.title &&
                (craftData += 'I have a professional license as ' + license.title + '\n');
              license.degree &&
                license.degree !== 'other' &&
                (craftData +=
                  'My Degree is ' +
                  degrees.find((degree) => degree.key === license.degree).label +
                  '\n');
              license.institution &&
                (craftData += 'The issuer of the license was ' + license.institution + '\n');
              license.achieved && (craftData += 'I achieved it on ' + license.achieved + '\n');
            });

            craftData += 'SECTION: CERTIFICATIONS\n'; // Corrected the initial value
            cvInputData.certifications.map((certification, index) => {
              craftData += `Certification #${index + 1}:\n`; // Add enumeration
              certification.title &&
                (craftData += "I'm certified as " + certification.title + '\n');
              certification.institution &&
                (craftData +=
                  'The issuer of the certification was ' + certification.institution + '\n');
              certification.achieved &&
                (craftData += 'I achieved it on ' + certification.achieved + '\n');
              certification.expiration &&
                !certification.perpetual &&
                (craftData += 'It expires on ' + certification.expiration + '\n');
              certification.certificationID &&
                (craftData +=
                  'My Certification ID is ' + certification.certificationID + '\n');
              certification.certificationURL &&
                (craftData +=
                  'The Certificate URL is ' + certification.certificationURL + '\n');
            });

            craftData += 'SECTION: SKILLS\n'; // Corrected the initial value
            craftData += "I'm skilled in: "; // Corrected the initial value
            cvInputData.skills.map((skill) => {
              skill.skillName && (craftData += skill.skillName + ', ');
            });
            craftData += '\n';

            craftData += 'SECTION: LANGUAGES\n'; // Corrected the initial value
            cvInputData.languages.map((language, index) => {
              craftData += `Language #${index + 1}: `; // Add enumeration
              language.language &&
                (craftData +=
                  'I can speak ' +
                  languagesList.find((languageItem) => languageItem.key === language.language)
                    .label +
                  ', ');
              language.proficiencyLevel &&
                (craftData +=
                  'my proficiency level is ' +
                  proficiencyLevels.find(
                    (proficiencyLevel) => proficiencyLevel.key === language.proficiencyLevel
                  ).label +
                  '\n');
            });

            craftData += 'SECTION: PERSONAL REFERENCES\n'; // Corrected the initial value
            cvInputData.personalReferences.map((personalReference, index) => {
              craftData += `Reference #${index + 1}: `; // Add enumeration
              personalReference.name && (craftData += personalReference.name + ', ');
              personalReference.institution &&
                (craftData += personalReference.institution + ', ');
              personalReference.position && (craftData += personalReference.position + ', ');
              personalReference.email && (craftData += personalReference.email + ', ');
              personalReference.telephoneNumber &&
                (craftData += personalReference.telephoneNumber + '\n');
            });

            geniusCommand += 'Step 2: Consider the following CRAFTING_DATA to build the CV\n';
            geniusCommand += '```START OF CRAFTING_DATA\n';

            geniusCommand += craftData;

            geniusCommand += 'END OF CRAFTING_DATA```\n';
            geniusCommand +=
              'Step 3: Enhance the Profile from PERSONAL INFORMATION using CRAFTING_DATA\n';
            /*continue writing */
            break;
          case 'optimize':
            // Get the URL of the saved PDF
            let url_cv = pendingTaskData.geniusBody.url_cv;
            let pdf_url = encodeURIComponent(url_cv);
            // Calling the PDF via an API
            let responsePdf = await callPdf(pdf_url);
            geniusCommand += `Step 1: Use the provided CV as a basis to build a new version. Analyze the candidate's experience, skills, and achievements, ensuring all extracted information is structured for optimal readability.\n `;
            geniusCommand += trimToMaxTokens(responsePdf) + '\n';
            geniusCommand +=
              'Step 2: Analyze the  experience of candidate, skills, and achievements to identify the most relevant and impactful information for the new CV.\n';
            geniusCommand +=
              'Step 3: Optimize the CV by enhancing clarity, highlighting key achievements with action verbs, and ensuring ATS compatibility. Remove redundant details and tailor content to the target role.\n';

            break;
          case 'spotlight':
            let Analyze = pendingTaskData.geniusBody.analysis;
            let cv = pendingTaskData.geniusBody.cv;
            geniusCommand +=
              'Step 1: Step 1: Use the provided CV as a basis to build a new version. Analyze the candidate s experience, skills, and achievements, ensuring all extracted information is structured for optimal readability.:\n';
            geniusCommand += cv + '\n';
            geniusCommand +=
              'Step 2: Consider the following ANALYSE as an analysis of the applicants strengths and weaknesses in the job to be applied for to build the CV\n';
            geniusCommand += '```START OF ANALYZE\n';
            geniusCommand += Analyze + '\n';
            geniusCommand += 'END OF ANALYZE```\n';
            geniusCommand +=
              'Step 3: Enhance your CV by highlighting your strengths and disguising your weaknesses.\n';
            break;
        }

        // usar plantilla de markdown
        //
        geniusCommand +=
          'Step 4:  Generate a new CV using the provided information in previous steps, emphasizing skills and organizing it into sections such as Professional Summary, Goals and Objectives, Education, Skills, Experience, Extracurricular Activities, Languages, and References. You may add or modify sections to enhance professionalism. Arrange each sections content from latest to earliest when applicable, and remove any empty or irrelevant sections. Optimize content for readability, eliminating redundant or obvious text.\n';
        geniusCommand +=
          'Step 5:  Ensure the Professional Summary of the new CV section is succinct, non-redundant, and short but professional enough.\n';
        //       geniusCommand += `Step 6: Format the new CV entirely in HTML, starting with a <div> tag. Use inline CSS styling inside a <style> tag without modifying container classes or primary tags like body, p, h1, h2, h3, h4, h5, and h6.

        // - The candidate's name must be the **largest** text and bold.
        // - Section titles (e.g., "Professional Summary", "Education", "Skills") should be slightly smaller than the name but still bold.
        // - The main text should be the smallest, ensuring readability.

        // Use <p> for descriptions and <ul> with <li> for lists, ensuring a structured and readable layout. All text must be black (#000).

        // All hyperlinks **must** be displayed in full and clickable using the <a> tag.
        //  **Example:**
        //    - LinkedIn: <a href="https://www.linkedin.com">https://www.linkedin.com//</a>
        //    - Portfolio: <a href="https://portafoliop">https://portafolio</a>

        // The output must be fully formatted in HTML, without borders or additional decorations, and optimized for both web integration and printing.\n`;

        //geniusCommand += 'Utilize <ul> and <li> tags for bullet items within each section, and add extra <p> and <br> tags for visual spacing where appropriate.\n';
        //geniusCommand += 'Ensure the HTML is ready for inclusion in a web page.\n';
        // geniusCommand += `Ensure that all hyperlinks are displayed in full. Instead of embedding them within text, they should appear as complete, clickable URLs using the <a> tag, e.g., <a href="https://example.com">https://example.com</a>.\n`;
        // geniusCommand += `Format the new CV entirely in HTML. The output must start with a <div> tag and include inline CSS styling inside a <style> tag. All text must be black (#000), and titles, including the candidate’s name, must be bold using the <strong> or <b> tag. Do not modify styles of container classes or primary tags like body, p, h1, h2, h3, h4, h5, and h6. Ensure the HTML is ready for web page integration.\n`;
        // geniusCommand += `Format the CV in HTML following a structured layout without borders. The candidate's name should be the main title and bold. Each section title (e.g., "Professional Summary", "Education", "Skills") must be bold and in sentence case. Use paragraphs <p> for descriptions and <ul> with <li> for lists. Ensure all text is black (#000) and neatly aligned. Contact details and links should be fully visible and clickable. No additional decorations, only a clean, readable format optimized for both screen viewing and printing.\n`;
        geniusCommand += `Step 6: Format the new CV entirely in HTML, starting with a <div> tag. Convert the following ATS-friendly resume written  a clean, semantic HTML format using appropriate tags such as 
       <h1>,  <h2>, <p>,  <ul>, and  <li>
        . Maintain the structure and readability while ensuring accessibility
        Example: 
        # **[Your Name]**  
    
        ## Professional Summary  
        [Write a brief summary highlighting your key skills, experience, and career focus. Example: "Full Stack Developer with expertise in React, TypeScript, and Node.js. Passionate about building scalable applications and optimizing system performance."]  

        ## Work Experience  
        ### [Job Title] | [Company Name] | [Start Date] - [End Date or Present]  
        - [Responsibility or achievement 1]  
        - [Responsibility or achievement 2]  
        - [Responsibility or achievement 3]  

        ### [Job Title] | [Company Name] | [Start Date] - [End Date]  
        - [Responsibility or achievement 1]  
        - [Responsibility or achievement 2]  
        - [Responsibility or achievement 3]  

        ## Education  
        [Degree] | [University Name] | [Year of Graduation]  

        ## Skills  
        - **Frontend:** [Example: React, TypeScript, Tailwind CSS]  
        - **Backend:** [Example: Node.js, Express, SQL Server]  
        - **DevOps:** [Example: Azure, AWS, GitHub Actions]  
        - **Methodologies:** [Example: Agile, Scrum]  

        ## Languages  
        - [Language 1] (Fluent/Native)  
        - [Language 2] (Intermediate/Advanced)  

        ## Certifications  
        - [Certification Name] | [Issuing Organization] | [Year]  
        - [Certification Name] | [Issuing Organization] | [Year]  
        
        ## Contact
       **[Email]**: [Example: example@sistemas.com.pe]
       **[Telephone]**: [Example: +51974656123]  
       **[LinkedIn]**: [Example: https://linkedin.com/in/https://www.linkedin.com/in/example]   
       **[Github]**: [Example:  https://github.com/https://github.com/example] 
       **[Portfolio]**:  [Example: https://portafolio-example ]   
       \n
`;
        geniusCommand += ` step 6.5: All hyperlinks **must** be displayed in full and clickable using the <a> tag.
       **Example:**
         - LinkedIn: <a href="https://www.linkedin.com">https://www.linkedin.com//</a>
         - Portfolio: <a href="https://portafoliop">https://portafolio</a>
      
      `;

        geniusCommand += `Step 7:  The all text output must be in ${
          languagesList.find((lang) => lang.key === LENGUAGE_KEY).label
        }, and the final result should only contain the formatted HTML inside the main <div> tag, with no additional text or comments outside of it.\n`;

        try {
          console.log('PROMPT: ', geniusCommand);
          const response = await fetch(`${URL_BASE}/api/generate-cv`, {
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
              dataResult =
                divStartIndex !== -1 ? dataResult.substring(divStartIndex) : dataResult;

              await taskDocumentRef.update({
                geniusResponse: dataResult,
                status: 'finalized',
              });
              // delete the file on firebase

              await taskDoc.ref.update({ status: 1 });
              if (pendingTaskData.geniusApp === 'optimize') {
                await deleteFileFromUrl(pendingTaskData.geniusBody.url_cv);
              }
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
};
