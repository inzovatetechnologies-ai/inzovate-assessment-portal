export type UserRole =
  | 'Super Admin'
  | 'Admin'
  | 'HR Manager'
  | 'HR Executive'
  | 'College Coordinator'
  | 'Evaluator'
  | 'Candidate'
  | 'Public';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  candidateId?: string;
  collegeId?: string;
}

export interface Domain {
  _id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  color: string;
  status: string;
}

export interface JobRole {
  _id: string;
  domainId: string;
  title: string;
  code: string;
  description: string;
  skills: string[];
  passingThreshold: number;
  status: string;
}

export interface College {
  _id: string;
  name: string;
  code: string;
  university: string;
  address: string;
  placementOfficer: string;
  contactEmail: string;
  phoneNumber: string;
  departments: string[];
  graduationYears: string[];
  status: string;
}

export interface RecruitmentDrive {
  _id: string;
  driveId: string;
  name: string;
  collegeId: string;
  collegeName: string;
  recruitmentDate: string;
  registrationDeadline: string;
  eligibleDepartments: string[];
  eligibleGraduationYears: string[];
  availableJobRoles: string[];
  maxCandidates: number;
  status: string;
  instructions: string;
}

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  _id: string;
  section: 'section-1' | 'section-2' | 'section-3';
  roleId?: string;
  category: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: QuestionOption[];
  correctOption?: string;
  explanation?: string;
  marks?: number;
  isApproved?: boolean;
}

export interface Candidate {
  _id: string;
  candidateId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth?: string;
  gender?: string;
  residentialAddress?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  profilePhotoUrl?: string;

  fatherName?: string;
  fatherMobile?: string;
  motherName?: string;
  emergencyContact?: string;
  relationship?: string;

  collegeId: string;
  collegeName: string;
  collegeRegNumber?: string;
  universityRegNumber?: string;
  degree: string;
  department: string;
  graduationYear: string;
  cgpa: string;
  tenthPercentage?: string;
  twelfthPercentage?: string;
  arrearStatus?: string;
  backlogCount?: number;
  resumeFileName?: string;
  linkedinUrl?: string;
  githubUrl?: string;

  driveId: string;
  jobRoleId: string;
  jobRoleTitle: string;
  domainId: string;
  domainName: string;
  technicalSkills?: string[];
  preferredLocation?: string;
  employmentType?: string;

  isEmailVerified: boolean;
  isMobileVerified: boolean;
  termsAccepted: boolean;
  webcamConsent: boolean;
  recordingConsent: boolean;

  recruitmentStage: 'Registered' | 'Assessment Pending' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Rejected';
  assessmentStatus: 'Ready' | 'In Progress' | 'Completed' | 'Terminated' | 'Suspended';
  totalScore?: number;
  maxScore?: number;
  percentage?: number;
  performanceCategory?: string;
  createdAt: string;
}

export interface AssessmentResult {
  _id: string;
  sessionId: string;
  candidateId: string;
  candidateDisplayId: string;
  candidateName: string;
  candidateEmail: string;
  jobRoleId: string;
  jobRoleTitle: string;
  domainName: string;
  collegeName: string;
  driveId: string;
  assessmentDate: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  performanceCategory: 'Outstanding' | 'Excellent' | 'Good' | 'Needs Improvement' | 'Requires Further Evaluation';
  sectionScores: {
    section1: { title: string; score: number; max: number; percentage: number };
    section2: { title: string; score: number; max: number; percentage: number };
    section3: { title: string; score: number; max: number; percentage: number };
  };
  timeTakenMinutes: number;
  violationsCount: number;
  certificateId: string;
  verificationHash: string;
  submissionType?: string;
  isPublished: boolean;
  createdAt: string;
}

export interface LiveSession {
  sessionId: string;
  candidateId: string;
  candidateName: string;
  collegeName: string;
  jobRoleTitle: string;
  domainName: string;
  status: string;
  currentSection: string;
  answeredCount: number;
  remainingQuestions: number;
  totalQuestions: number;
  timeRemainingSeconds: number;
  cameraStatus: string;
  networkStatus: string;
  violationsCount: number;
  startedAt: string;
}
