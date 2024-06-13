import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import fetch from 'node-fetch';

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
const querySnapshot = await getDocs(query(tasksCollection, where('status', '==', 0)));

for (const taskDoc of querySnapshot.docs) {
  const taskData = taskDoc.data();
  console.log('taskDoc.id', taskDoc.id);

  if (taskData.requestPath) {
    console.log('taskData.requestPath', taskData.requestPath);
    const taskDocumentRef = doc(firestore, taskData.requestPath);
    const taskDocument = await getDoc(taskDocumentRef);

    if (taskDocument.exists()) {
      console.log("taskDocument.data()", taskDocument.data());
      const pendingTaskData = taskDocument.data();
      let firstName = pendingTaskData.firstName;
      let lastName = pendingTaskData.lastName;
      let email = pendingTaskData.email;
      let telephoneNumber = pendingTaskData.telephoneNumber;
      let about = pendingTaskData.about;
      let geniusCommand = 'Your task is to build a CV for the following professional. The Personal Information starts and ends withinn triple backticks:\n';
      geniusCommand += '```START OF PERSONAL INFORMATION\n';
      geniusCommand += 'First Name: ' + firstName + '\n';
      geniusCommand += 'Last Name: ' + lastName + '\n';
      geniusCommand += 'Email: ' + email + '\n';
      geniusCommand += 'Telephone number: ' + telephoneNumber + '\n';
      geniusCommand += 'Description: ' + about + '\n';
      geniusCommand += 'END OF PERSONAL INFORMATION```\n';
      geniusCommand += 'Consider the following CV INPUT DATA, contained between triple backticks, to build the corresponding professional CV.\n';
      geniusCommand += '```START OF CV INPUT DATA\n';

      switch (pendingTaskData.geniusApp) {
        case 'scratch':
          const scratchAnswers = pendingTaskData.geniusBody;
          let scratchInterview = 'Interview:\n';
          scratchInterview += "Question: " + scratchQuestions.passion + "\nAnswer: " + scratchAnswers.passion + "\n";
          scratchInterview += "Question: " + scratchQuestions.envision + "\nAnswer: " + scratchAnswers.envision + "\n";
          scratchInterview += "Question: " + scratchQuestions.field_of_study + "\nAnswer: " + scratchAnswers.field_of_study + "\n";
          scratchInterview += "Question: " + scratchQuestions.motivation + "\nAnswer: " + scratchAnswers.motivation + "\n";
          scratchInterview += "Question: " + scratchQuestions.studies + "\nAnswer: " + scratchAnswers.studies + "\n";
          scratchInterview += "Question: " + scratchQuestions.skills + "\nAnswer: " + scratchAnswers.skills + "\n";
          scratchInterview += "Question: " + scratchQuestions.experience + "\nAnswer: " + scratchAnswers.experience + "\n";
          scratchInterview += "Question: " + scratchQuestions.activities + "\nAnswer: " + scratchAnswers.activities + "\n";
          scratchInterview += "Question: " + scratchQuestions.languages + "\nAnswer: " + scratchAnswers.languages + "\n";
          scratchInterview += "Question: " + scratchQuestions.references + "\nAnswer: " + scratchAnswers.references + "\n";
          geniusCommand += scratchInterview;

          break;
        case 'craft':
          // Implement 'craft' case handling here
          break;
        case 'optimize':
          // Implement 'optimize' case handling here
          break;
        case 'spotlight':
          // Implement 'spotlight' case handling here
          break;
      }
      geniusCommand += 'END OF CV INPUT DATA```\n';
      geniusCommand += 'The Description from the PERSONAL INFORMATION should be improved with the information from the CV INPUT DATA.\n';
      geniusCommand += 'Your output will be a CV in Spanish, using all the provided information and highlighting skills and having sections like Professional Summary, Goals and Objectives, Education, Skills, Experience, Extracurricular Activities, Languages, and References.\n';
      geniusCommand += 'You can add or modify sections as you consider to be more professional. Your generated answer should be in HTML format starting from a <div> tag, using the Name as title, formatting and structuring it with elegant inline CSS style design inside it\'s respective <style> tag, with tags <ul> and <li> for bullet items inside each section where possible and correctly spaced detailed with extra <p> and <br> between sections where it visually fits, ready to be included into a web page.\n';
      geniusCommand += 'Don\'t add text or any comment outside the <div> generated answer, remove from your answer any text outside of the main <div> tag until the answer is the CV only.\n';

      try {
        console.log("PROMPT", geniusCommand);
        const response = await fetch('http://localhost:3000/api/generate-cv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ geniusPrompt: geniusCommand }),
        });

        const data = await response.json();
        if (data.result) {
          console.log("data.result", data.result);

          try {
            await updateDoc(taskDocumentRef, { geniusResponse: data.result, status: 'finalized' });
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
