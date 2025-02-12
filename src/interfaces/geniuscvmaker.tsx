import { Timestamp } from '@firebase/firestore';

interface workExperience {
  companyName: string;
  dateFrom: string;
  dateTo: string;
  current: boolean;
  position: string;
  achievements: string;
}

export interface CVRequest {
  id: string;
  createdAt: Timestamp;
  geniusApp: string;
  // geniusBody: {
  //   activities: string;
  //   envision: string;
  //   experience: string;
  //   field_of_study: string;
  //   languages: string;
  //   motivation: string;
  //   passion: string;
  //   references: string;
  //   skills: string;
  //   studies: string;
  // };
  status: string;
}

interface license {
  institution: string;
  achieved: string;
  degree: string;
  title: string;
}

interface certification {
  institution: string;
  achieved: string;
  title: string;
  certificationURL: string;
  certificationID: string;
  expiration: string;
  perpetual: boolean;
}

interface skill {
  skillName: string;
}

interface language {
  language: string;
  proficiencyLevel: string;
}

interface personalReference {
  name: string;
  institution: string;
  position: string;
  telephoneNumber: string;
  email: string;
}

export interface CvCraft {
  id?: string;
  firstName: string | '';
  lastName: string | '';
  email: string | '';
  telephoneNumber: string | '';
  about: string | '';
  facebook: string | '';
  instagram: string | '';
  linkedin: string | '';
  tiktok: string | '';
  youtube: string | '';
  github: string | '';
  workExperiences: workExperience[];
  licenses: license[];
  certifications: certification[];
  skills: skill[];
  languages: language[];
  personalReferences: personalReference[];
}

export interface CVRequest {
  id: string;
  createdAt: Timestamp;
  geniusApp: string;
  status: string;
}
