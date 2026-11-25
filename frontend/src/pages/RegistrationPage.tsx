import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Domain, JobRole, College, RecruitmentDrive } from '../types';
import {
  User,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Mail,
  Phone,
  Check,
  Lock,
  Building,
  Clock,
  IdCard,
} from 'lucide-react';

interface RegistrationPageProps {
  onRegistrationSuccess: (candidate: any) => void;
  onCancel: () => void;
  onOpenLogin: (initialIdentifier?: string, initialPassword?: string) => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  onRegistrationSuccess,
  onCancel,
  onOpenLogin,
}) => {
  const [step, setStep] = useState(1);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success Modal State (persisted in sessionStorage so refresh does not lose it)
  const [successInfo, setSuccessInfo] = useState<{
    candidateId: string;
    fullName: string;
    email: string;
    candidateObj?: any;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('inzovate_reg_success');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal & Account Credentials
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    altMobileNumber: '',
    dateOfBirth: '',
    gender: 'Male',
    residentialAddress: '',
    district: '',
    state: 'Tamil Nadu',
    pinCode: '',
    profilePhotoUrl: '',

    // Step 2: Parent / Guardian
    fatherName: '',
    fatherMobile: '',
    motherName: '',
    emergencyContact: '',
    relationship: 'Father',

    // Step 3: Academic
    collegeId: '',
    collegeName: '',
    collegeRegNumber: '',
    universityRegNumber: '',
    degree: 'B.E. / B.Tech',
    department: '',
    specialization: 'Software Engineering',
    currentYear: 'Final Year',
    graduationYear: '2026',
    cgpa: '8.5',
    tenthPercentage: '92.0',
    twelfthPercentage: '90.5',
    arrearStatus: 'No History',
    backlogCount: 0,
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',

    // Step 4: Recruitment
    driveId: 'INZ-DRIVE-2026-01',
    domainId: 'dom-01',
    domainName: 'Software Development',
    jobRoleId: 'role-soft-dev',
    jobRoleTitle: 'Software Developer',
    technicalSkills: 'Data Structures, Algorithms, SQL, Java',
    programmingLanguages: 'Java, Python, C++',
    preferredLocation: 'Chennai / Bengaluru / Hybrid',
    employmentType: 'Full-Time (Direct Fresher)',

    // Step 5: Verification, Slot & Consent
    examSlot: 'Immediate Online Assessment (Now)',
    idDocType: 'College ID Card',
    idDocNumber: '',
    candidateDeclaration: false,
    privacyAccepted: false,
    termsAccepted: false,
    webcamConsent: false,
    recordingConsent: false,
  });

  // Strict Instant Scroll-To-Top on Registration Step Change & Mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [step]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [domRes, roleRes, colRes, driveRes] = await Promise.all([
          api.getDomains(),
          api.getJobRoles(),
          api.getColleges(),
          api.getDrives(),
        ]);

        const rawDomains = domRes.domains || (Array.isArray(domRes) ? domRes : []);
        let loadedDomains = Array.isArray(rawDomains) ? [...rawDomains] : [];
        // Ensure "Process Associate" domain is available
        const hasProcAssoc = loadedDomains.some(
          (d: any) => d.name.toLowerCase().includes('process associate') || d.code === 'PROC-ASSOC'
        );
        if (!hasProcAssoc) {
          loadedDomains = [
            ...loadedDomains,
            {
              _id: 'dom-13',
              name: 'Process Associate',
              code: 'PROC-ASSOC',
              description: 'Customer interaction, back-office operations, business process management and client SLAs.',
              color: '#0284C7',
            },
          ];
        }
        setDomains(loadedDomains);

        const rawRoles = roleRes.roles || (Array.isArray(roleRes) ? roleRes : []);
        let loadedRoles = Array.isArray(rawRoles) ? [...rawRoles] : [];
        // Ensure "Process Associate" role is available
        const hasProcRole = loadedRoles.some(
          (r: any) => r.title.toLowerCase().includes('process associate')
        );
        if (!hasProcRole) {
          loadedRoles = [
            ...loadedRoles,
            {
              _id: 'role-process-assoc',
              domainId: 'dom-13',
              title: 'Process Associate',
              code: 'ROLE-PA-2026',
              description: 'Handling client processes, query resolution, voice & non-voice workflow, and operational SLAs.',
            },
          ];
        }
        setJobRoles(loadedRoles);

        const rawColleges = colRes.colleges || (Array.isArray(colRes) ? colRes : []);
        if (Array.isArray(rawColleges) && rawColleges.length > 0) {
          setColleges(rawColleges);
        }

        const rawDrives = driveRes.drives || (Array.isArray(driveRes) ? driveRes : []);
        if (Array.isArray(rawDrives) && rawDrives.length > 0) {
          setDrives(rawDrives);
        }
      } catch (err) {
        console.error('Failed to load registration meta:', err);
      }
    }
    loadMeta();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDomainSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const domId = e.target.value;
    const matchedDomain = domains.find((d) => d._id === domId);
    const domainRoles = jobRoles.filter((r) => r.domainId === domId);
    const matchedRole = domainRoles[0] || jobRoles.find((r) => r.domainId === domId);
    setFormData((prev) => ({
      ...prev,
      domainId: domId,
      domainName: matchedDomain ? matchedDomain.name : prev.domainName,
      jobRoleId: matchedRole ? matchedRole._id : prev.jobRoleId,
      jobRoleTitle: matchedRole ? matchedRole.title : prev.jobRoleTitle,
    }));
  };

  const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    const matchedRole = jobRoles.find((r) => r._id === roleId);
    const matchedDomain = matchedRole ? domains.find((d) => d._id === matchedRole.domainId) : null;
    setFormData((prev) => ({
      ...prev,
      jobRoleId: roleId,
      jobRoleTitle: matchedRole ? matchedRole.title : prev.jobRoleTitle,
      domainId: matchedDomain ? matchedDomain._id : prev.domainId,
      domainName: matchedDomain ? matchedDomain.name : prev.domainName,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.mobileNumber.trim()) {
      setErrorMsg('Full Name, Email, and Mobile Number are required in Step 1.');
      setStep(1);
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrorMsg('Please set a password of at least 6 characters in Step 1.');
      setStep(1);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match in Step 1.');
      setStep(1);
      return;
    }
    if (!formData.collegeName.trim()) {
      setErrorMsg('Please type your College / University name in Step 3.');
      setStep(3);
      return;
    }
    if (!formData.department.trim()) {
      setErrorMsg('Please enter your Department / Branch in Step 3.');
      setStep(3);
      return;
    }
    if (!formData.termsAccepted || !formData.webcamConsent || !formData.candidateDeclaration) {
      setErrorMsg('Please review and check all mandatory declarations and camera consent options.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const selectedRole = jobRoles.find((r) => r._id === formData.jobRoleId);
      const selectedDomain = domains.find((d) => d._id === (selectedRole?.domainId || formData.domainId));
      const roleTitle = selectedRole?.title || formData.jobRoleTitle || 'Software Developer';
      const domainName = selectedDomain?.name || formData.domainName || 'Software Development';

      const res = await api.registerCandidate({
        ...formData,
        jobRoleId: selectedRole?._id || formData.jobRoleId,
        jobRoleTitle: roleTitle,
        domainId: selectedDomain?._id || formData.domainId,
        domainName: domainName,
        isEmailVerified: true,
        isMobileVerified: true,
      });

      if (res.success) {
        const enrichedCandidate = {
          ...(res.candidate || {}),
          id: res.candidateId || res.candidate?.candidateId,
          candidateId: res.candidateId || res.candidate?.candidateId,
          fullName: formData.fullName,
          email: formData.email,
          role: 'Candidate',
          jobRoleId: selectedRole?._id || formData.jobRoleId,
          jobRoleTitle: roleTitle,
          domainId: selectedDomain?._id || formData.domainId,
          domainName: domainName,
          collegeName: formData.collegeName,
        };
        try {
          localStorage.setItem('inzovate_user', JSON.stringify(enrichedCandidate));
          localStorage.setItem('inzovate_token', res.token || 'inz_session_direct');
          localStorage.removeItem('inzovate_exam_completed');
        } catch (e) {}

        const infoObj = {
          candidateId: res.candidateId,
          fullName: formData.fullName,
          email: formData.email,
          candidateObj: enrichedCandidate,
        };
        try {
          sessionStorage.setItem('inzovate_reg_success', JSON.stringify(infoObj));
        } catch (e) {}
        setSuccessInfo(infoObj);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = jobRoles.filter((r) => r.domainId === formData.domainId);
  const selectedRole = jobRoles.find((r) => r._id === formData.jobRoleId);

  const matchingColleges = colleges.filter((col) => {
    if (!formData.collegeName.trim()) return false;
    const q = formData.collegeName.toLowerCase();
    const matchesName = col.name.toLowerCase().includes(q);
    const matchesDistrict = ((col as any).district || '').toLowerCase().includes(q);
    const matchesCode = ((col as any).code || '').toLowerCase().includes(q);
    return matchesName || matchesDistrict || matchesCode;
  }).slice(0, 15);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Identity Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
            <img src="/inzovate-logo.png" alt="Inzovate Technologies" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0A1128] tracking-tight">
              INZOVATE TECHNOLOGIES PRIVATE LIMITED
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Official Candidate Registration & CBT Examination Gateway • CIN: <span className="font-mono text-blue-600 font-bold">U62011TZ2025PTC036329</span>
            </p>
          </div>
        </div>
      </div>

      {/* Wizard Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Personal & Password', icon: User },
            { num: 2, label: 'Parent Details', icon: Phone },
            { num: 3, label: 'Academic Details', icon: GraduationCap },
            { num: 4, label: 'Recruitment Role', icon: Briefcase },
            { num: 5, label: 'Review & Complete', icon: ShieldCheck },
          ].map((item, index) => {
            const Icon = item.icon;
            const isCompleted = step > item.num;
            const isCurrent = step === item.num;
            return (
              <div key={item.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-2 hidden sm:block ${
                      isCurrent ? 'text-blue-700' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {index < 4 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-2 ${
                      step > item.num ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700 text-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="font-bold">
              {errorMsg.toLowerCase().includes('already registered') ? 'Already Registered' : 'Registration Alert'}
            </p>
            <p>{errorMsg}</p>
            {errorMsg.toLowerCase().includes('already registered') && (
              <button
                type="button"
                onClick={() => onOpenLogin(formData.email, formData.password)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] inline-flex items-center space-x-1 shadow-sm"
              >
                <span>Sign In with Existing Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step Forms */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* STEP 1: Personal Details & Account Credentials */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-[#0A1128]">Step 1: Personal Details & Login Credentials</h3>
              <p className="text-xs text-slate-500">
                You must set your login password here. One-time registration rule strictly applies.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Candidate Full Name (As per College Records) *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Rohit Sharma"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. rohit.sharma@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (WhatsApp Enabled) *</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Password Fields */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span>Create Your Candidate Portal Password</span>
                  </p>
                  <p className="text-[11px] text-blue-700">
                    You will need this password along with your Candidate ID to log in and take the assessment.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Password (Min 6 chars) *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code *</label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="e.g. 641004"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address *</label>
                <textarea
                  name="residentialAddress"
                  value={formData.residentialAddress}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Street, locality, city and state..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Parent / Guardian Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-[#0A1128]">Step 2: Parent / Guardian & Emergency Contact</h3>
              <p className="text-xs text-slate-500">
                Required for emergency contact and official recruitment record keeping.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Father's Full Name *</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  placeholder="e.g. S. K. Sharma"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Father's Mobile Number *</label>
                <input
                  type="tel"
                  name="fatherMobile"
                  value={formData.fatherMobile}
                  onChange={handleChange}
                  placeholder="+91 98765 11111"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mother's Full Name (Optional)</label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  placeholder="Mother's name"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Number *</label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact || formData.fatherMobile}
                  onChange={handleChange}
                  placeholder="+91 98765 11111"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Academic Details (Resume Removed, Typeable College Added) */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-[#0A1128]">Step 3: Academic Qualifications & Scores</h3>
              <p className="text-xs text-slate-500">
                Type your College / University name and enter your degree information and cumulative CGPA.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Typeable College Input with Interactive Auto-Suggest */}
              <div className="sm:col-span-2 relative">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center">
                    <Building className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    <span>College / University Name *</span>
                  </span>
                  <span className="text-[10px] text-blue-600 font-medium">(Type freely or pick from 99+ colleges)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={(e) => {
                      handleChange(e);
                      setShowCollegeDropdown(true);
                    }}
                    onFocus={() => setShowCollegeDropdown(true)}
                    placeholder="Type your College name (e.g. Kongu, PSNA, CIT, MCET, Anna University)..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                    required
                    autoComplete="off"
                  />
                  {formData.collegeName && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, collegeName: '', collegeId: '' }));
                        setShowCollegeDropdown(false);
                      }}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filterable Dropdown */}
                {showCollegeDropdown && matchingColleges.length > 0 && (
                  <div className="absolute top-16 left-0 right-0 z-30 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {matchingColleges.map((col) => (
                      <div
                        key={col._id}
                        onMouseDown={() => {
                          setFormData((prev) => ({
                            ...prev,
                            collegeName: col.name,
                            collegeId: col._id,
                            district: prev.district || (col as any).district || '',
                          }));
                          setShowCollegeDropdown(false);
                        }}
                        className="p-3 hover:bg-blue-50/80 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800">{col.name}</p>
                            <p className="text-[10px] text-slate-400">{col.address || col.university}</p>
                          </div>
                        </div>
                        {(col as any).district && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold shrink-0">
                            {(col as any).district}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Type your full institution name directly or choose from 99+ Tamil Nadu engineering colleges.</span>
                  {matchingColleges.length > 0 && showCollegeDropdown && (
                    <button
                      type="button"
                      onClick={() => setShowCollegeDropdown(false)}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Close list
                    </button>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College Registration / Roll No *</label>
                <input
                  type="text"
                  name="collegeRegNumber"
                  value={formData.collegeRegNumber}
                  onChange={handleChange}
                  placeholder="e.g. 22CS104"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Degree *</label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="e.g. B.E. / B.Tech"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Branch *</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. CSE, AI&DS, ECE, IT, EEE, Mechanical"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year *</label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="2025">2025 (Immediate Joiner)</option>
                  <option value="2026">2026 (Campus Fresher Batch)</option>
                  <option value="2027">2027 (Internship Batch)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cumulative CGPA / Percentage *</label>
                <input
                  type="text"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="e.g. 8.85 (or 88.5%)"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Arrear / Backlog Status</label>
                <select
                  name="arrearStatus"
                  value={formData.arrearStatus}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="No History">No History of Arrears (Clear All)</option>
                  <option value="Cleared Backlogs">Cleared All Previous Backlogs</option>
                  <option value="1 Standing Arrear">1 Standing Arrear</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">10th Standard Percentage (%)</label>
                <input
                  type="text"
                  name="tenthPercentage"
                  value={formData.tenthPercentage}
                  onChange={handleChange}
                  placeholder="e.g. 92.0"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">12th Standard / Diploma Percentage (%)</label>
                <input
                  type="text"
                  name="twelfthPercentage"
                  value={formData.twelfthPercentage}
                  onChange={handleChange}
                  placeholder="e.g. 90.5"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Recruitment & Job Role (With Process Associate included) */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-[#0A1128]">Step 4: Recruitment Drive & Job Role Selection</h3>
              <p className="text-xs text-slate-500">
                Choose your Target Professional Domain (including Process Associate) and Applied Job Role.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recruitment Drive ID *</label>
                <select
                  name="driveId"
                  value={formData.driveId}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  {drives.map((d) => (
                    <option key={d._id} value={d.driveId}>
                      {d.driveId} – {d.name} ({d.collegeName})
                    </option>
                  ))}
                  <option value="INZ-DRIVE-2026-01">INZ-DRIVE-2026-01 – Inzovate Campus Fresher Drive 2026</option>
                </select>
              </div>

              {/* Target Professional Domain */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Professional Domain *</label>
                <select
                  name="domainId"
                  value={formData.domainId}
                  onChange={handleDomainSelect}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                >
                  {domains.map((dom) => (
                    <option key={dom._id} value={dom._id}>
                      {dom.name} {dom.code ? `(${dom.code})` : ''}
                    </option>
                  ))}
                  {/* Explicit fallback option if domains list is loading */}
                  {!domains.some((d) => d.name === 'Process Associate') && (
                    <option value="dom-13">Process Associate (PROC-ASSOC)</option>
                  )}
                </select>
              </div>

              {/* Applied Job Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Applied Job Role *</label>
                <select
                  name="jobRoleId"
                  value={formData.jobRoleId}
                  onChange={handleRoleSelect}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-blue-400 bg-blue-50/50 text-xs font-semibold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.title} ({role.code})
                      </option>
                    ))
                  ) : (
                    <option value="role-soft-dev">Software Developer (SD-01)</option>
                  )}
                </select>
              </div>

              {selectedRole && (
                <div className="sm:col-span-2 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-blue-900">
                    <Briefcase className="w-4 h-4 text-blue-700" />
                    <span>Technical Assessment Allocation: {selectedRole.title} (15 Specialized Questions)</span>
                  </div>
                  <p className="text-blue-800 leading-relaxed">{selectedRole.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Verification & Examination Consent (OTP Removed, Streamlined Direct Verification) */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-[#0A1128]">Step 5: Identity Confirmation & Examination Consent</h3>
              <p className="text-xs text-slate-500">
                Confirm your application summary, choose your assessment slot, and accept the online proctoring code of conduct.
              </p>
            </div>

            {/* Application Dossier Confirmation Summary Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center space-x-1.5 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Candidate Registration Verification Dossier</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  Profile Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-white/80 border border-blue-100">
                  <span className="text-slate-400 block text-[10px] font-semibold">CANDIDATE NAME</span>
                  <span className="font-bold text-slate-800">{formData.fullName || 'Registered Candidate'}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/80 border border-blue-100">
                  <span className="text-slate-400 block text-[10px] font-semibold">CONTACT DETAILS</span>
                  <span className="font-bold text-slate-800">{formData.email} • {formData.mobileNumber}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/80 border border-blue-100">
                  <span className="text-slate-400 block text-[10px] font-semibold">COLLEGE / INSTITUTION</span>
                  <span className="font-bold text-slate-800">{formData.collegeName || 'Specified Institution'}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/80 border border-blue-100">
                  <span className="text-slate-400 block text-[10px] font-semibold">APPLIED ROLE & DOMAIN</span>
                  <span className="font-bold text-blue-700">
                    {selectedRole ? selectedRole.title : (formData.jobRoleTitle || 'Software Developer')} • {domains.find(d => d._id === formData.domainId)?.name || (formData.domainName || 'Software Development')}
                  </span>
                </div>
              </div>
            </div>

            {/* Assessment Slot & Photo ID Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Preferred Assessment Session Slot *</span>
                </label>
                <select
                  name="examSlot"
                  value={formData.examSlot}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Immediate Online Assessment (Now)">Immediate Online Assessment (Start Now)</option>
                  <option value="Today Evening (06:00 PM - 07:00 PM)">Today Evening (06:00 PM - 07:00 PM)</option>
                  <option value="Tomorrow Morning (10:00 AM - 11:00 AM)">Tomorrow Morning (10:00 AM - 11:00 AM)</option>
                  <option value="College Scheduled Drive Slot">Official College Placement Drive Schedule</option>
                </select>
                <p className="text-[10px] text-slate-400">
                  Once registered, your exam timer begins when you launch the CBT interface.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <IdCard className="w-4 h-4 text-sky-600" />
                  <span>Photo ID Proof Reference</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    name="idDocType"
                    value={formData.idDocType}
                    onChange={handleChange}
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                  >
                    <option value="College ID Card">College ID Card</option>
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Passport / PAN">Passport / PAN Card</option>
                  </select>
                  <input
                    type="text"
                    name="idDocNumber"
                    value={formData.idDocNumber}
                    onChange={handleChange}
                    placeholder="ID No. (e.g. 710022...)"
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Keep this ID accessible in front of the proctoring camera during testing.
                </p>
              </div>
            </div>

            {/* Mandatory Consents */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start space-x-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="candidateDeclaration"
                  checked={formData.candidateDeclaration}
                  onChange={handleCheckbox}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I declare that my academic details and identity information are authentic. I understand one-time
                  registration applies and any duplicate registration will be flagged.
                </span>
              </label>

              <label className="flex items-start space-x-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="webcamConsent"
                  checked={formData.webcamConsent}
                  onChange={handleCheckbox}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  <strong>Camera & Proctoring Consent:</strong> I agree to continuous camera presence monitoring and full-screen examination mode throughout the 45-minute assessment. Closing the tab will immediately terminate the exam.
                </span>
              </label>

              <label className="flex items-start space-x-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleCheckbox}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I accept the Terms & Conditions and Inzovate Technologies Recruitment Evaluation Policy.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-500 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                if (step === 1) {
                  if (!formData.fullName || !formData.email || !formData.mobileNumber) {
                    setErrorMsg('Please fill in Full Name, Email, and Mobile Number.');
                    return;
                  }
                  if (!formData.password || formData.password.length < 6) {
                    setErrorMsg('Please create a password with at least 6 characters.');
                    return;
                  }
                  if (formData.password !== formData.confirmPassword) {
                    setErrorMsg('Passwords do not match.');
                    return;
                  }
                }
                if (step === 3 && !formData.collegeName.trim()) {
                  setErrorMsg('Please type your College / University name.');
                  return;
                }
                setStep(step + 1);
              }}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center space-x-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Registering...' : 'Complete Registration & Get Login'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Registration Success Modal with Credentials */}
      {successInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center space-y-5 shadow-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Registration Verified &amp; Account Active
              </span>
              <h2 className="text-2xl font-black text-[#0A1128] mt-2">Candidate Profile Created!</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your profile has been saved and your account is now active. Click below to proceed directly to launch
                your assessment.
              </p>
            </div>

            {/* Generated Credentials Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-left text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Your Username / Candidate ID:</span>
                <span className="font-mono font-black text-blue-700 text-sm bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {successInfo.candidateId}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Registered Email:</span>
                <span className="font-semibold text-slate-800">{successInfo.email}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-semibold">Login Password:</span>
                <span className="font-semibold text-slate-800">•••••••• (As created)</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] text-left leading-relaxed">
              <strong>Notice:</strong> One-time registration is strictly enforced. Keep your Candidate ID and password
              safe. If forgotten, use the "Forgot Password" option on the login screen.
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  const candidateData = successInfo.candidateObj || {
                    ...formData,
                    candidateId: successInfo.candidateId,
                  };
                  try {
                    sessionStorage.removeItem('inzovate_reg_success');
                  } catch (e) {}
                  setSuccessInfo(null);
                  onRegistrationSuccess(candidateData);
                }}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Start Assessment Immediately (Direct)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
