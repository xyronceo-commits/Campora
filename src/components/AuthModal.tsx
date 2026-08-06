import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_UNIVERSITIES } from '../data/mockData';
import { 
  X, Lock, Mail, User, Phone, Building2, GraduationCap, ArrowRight, ShieldCheck, 
  CheckCircle, FileText, Upload, CheckCircle2, Shield, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    authModalTab, 
    setAuthModalTab, 
    login, 
    loginGoogleOAuth,
    signUpEmailFirebase,
    signInEmailFirebase,
    resetPasswordFirebase,
    resendVerificationEmail,
    checkVerificationStatus,
    addToast 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [universityId, setUniversityId] = useState(INITIAL_UNIVERSITIES[0].id);
  
  // Agent Business & CAC / ID Verification Fields
  const [businessName, setBusinessName] = useState('');
  const [docType, setDocType] = useState<'cac' | 'nin' | 'voter' | 'driver' | 'passport'>('cac');
  const [docNumber, setDocNumber] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);

  // Sign In Role Selector state
  const [loginRole, setLoginRole] = useState<'student' | 'agent'>('student');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedDocName(file.name);
      addToast('Document Uploaded', `${file.name} ready for verification`, 'info');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      let role: 'student' | 'agent' | 'admin' = 'student';
      if (authModalTab === 'agent_signup') role = 'agent';
      else if (authModalTab === 'admin_login') role = 'admin';
      else if (authModalTab === 'login') role = loginRole;
      else role = 'student';

      await loginGoogleOAuth(role);
    } catch (err) {
      console.error('Google Auth Error:', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authModalTab === 'forgot_password') {
        await resetPasswordFirebase(email);
        setForgotSent(true);
      } else if (authModalTab === 'agent_signup') {
        await signUpEmailFirebase(email, password, name || 'Property Agent', 'agent', {
          phone,
          isVerifiedAgent: false,
          verificationStatus: 'none'
        });
      } else if (authModalTab === 'admin_login') {
        await signInEmailFirebase(email, password);
      } else if (authModalTab === 'login') {
        await signInEmailFirebase(email, password);
      } else {
        await signUpEmailFirebase(email, password, name || 'Student User', 'student', {
          phone,
          universityId
        });
      }
    } catch (err) {
      console.error('Submit Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-black text-white font-black flex items-center justify-center text-base shadow-sm">
                C
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {authModalTab === 'login' && 'Sign In to Campora'}
                  {authModalTab === 'student_signup' && 'Student Account Sign Up'}
                  {authModalTab === 'agent_signup' && 'Property Agent Sign Up'}
                  {authModalTab === 'admin_login' && 'Admin Console Sign In'}
                  {authModalTab === 'forgot_password' && 'Reset Account Password'}
                  {authModalTab === 'email_verification_sent' && 'Verify Your Email Address'}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {authModalTab === 'agent_signup'
                    ? 'Create an agent account (Business Verification follows)'
                    : 'Verified Student Housing Portal'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAuthModalOpen(false)}
              className="p-1.5 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Tab Selector */}
          {authModalTab !== 'forgot_password' && authModalTab !== 'email_verification_sent' && (
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 text-xs font-bold shrink-0">
              <button
                onClick={() => setAuthModalTab('student_signup')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  authModalTab === 'student_signup'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-neutral-900'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> Student
              </button>
              <button
                onClick={() => setAuthModalTab('agent_signup')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  authModalTab === 'agent_signup'
                    ? 'border-black dark:border-white text-black dark:text-white bg-white dark:bg-neutral-900'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Agent / CAC
              </button>
              <button
                onClick={() => setAuthModalTab('login')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                  authModalTab === 'login'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-neutral-900'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Sign In
              </button>
            </div>
          )}

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Google OAuth Button */}
            {authModalTab !== 'forgot_password' && authModalTab !== 'email_verification_sent' && (
              <div className="space-y-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs"
                >
                  {googleLoading ? (
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>
                        {authModalTab === 'student_signup' && 'Sign Up as Student with Google'}
                        {authModalTab === 'agent_signup' && 'Sign Up as Agent with Google'}
                        {authModalTab === 'admin_login' && 'Sign In as Admin with Google'}
                        {authModalTab === 'login' && `Sign In as ${loginRole === 'agent' ? 'Agent' : 'Student'} with Google`}
                      </span>
                    </>
                  )}
                </button>
                <div className="relative text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <span className="relative bg-white dark:bg-slate-800 px-3 text-[10px] uppercase font-black text-slate-400">
                    Or sign in with email
                  </span>
                </div>
              </div>
            )}

            {authModalTab === 'email_verification_sent' ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-md">
                  <Mail className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">Verification Link Sent ✉️</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    We dispatched a verification email to <span className="font-bold text-slate-800 dark:text-slate-200">{email}</span>. Please click the link in your email to confirm user legitimacy.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Why verify your email?</span>
                  </div>
                  <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-4">
                    <li>Protects the Campora student community against fake accounts.</li>
                    <li>Ensures you receive inspection passes and booking confirmation details.</li>
                    <li>Required for agent listing authorization.</li>
                  </ul>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={async () => {
                      const isVerified = await checkVerificationStatus();
                      if (isVerified) {
                        setAuthModalOpen(false);
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> I've Verified My Email
                  </button>

                  <button
                    type="button"
                    onClick={() => resendVerificationEmail()}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
                  >
                    Resend Email
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setAuthModalOpen(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pt-2 block mx-auto"
                >
                  Skip for now & explore
                </button>
              </div>
            ) : authModalTab === 'forgot_password' && forgotSent ? (
              <div className="text-center space-y-3 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Check Your Email</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We've sent password reset instructions to <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSent(false);
                    setAuthModalTab('login');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                {/* Account Type Differentiation for Sign In */}
                {authModalTab === 'login' && (
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        Sign In Account Type:
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${loginRole === 'agent' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'}`}>
                        {loginRole === 'agent' ? 'Agent / Landlord' : 'Student Account'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLoginRole('student')}
                        className={`p-2.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                          loginRole === 'student'
                            ? 'border-emerald-600 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                            : 'border-transparent bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        <span>Student Sign In</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLoginRole('agent')}
                        className={`p-2.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                          loginRole === 'agent'
                            ? 'border-indigo-600 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
                            : 'border-transparent bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        <span>Agent Sign In</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Full Name for Student or Agent */}
                {(authModalTab === 'student_signup' || authModalTab === 'agent_signup') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Tunde Bakare"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* University Select for Student Signup */}
                {authModalTab === 'student_signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Select Primary Campus
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={universityId}
                        onChange={(e) => setUniversityId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                      >
                        {INITIAL_UNIVERSITIES.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.shortName})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}



                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={authModalTab === 'admin_login' ? 'admin@campora.africa' : 'user@university.edu'}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Phone for signup */}
                {(authModalTab === 'student_signup' || authModalTab === 'agent_signup') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +234 803 123 4567"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Password Field */}
                {authModalTab !== 'forgot_password' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      {authModalTab === 'login' && (
                        <button
                          type="button"
                          onClick={() => setAuthModalTab('forgot_password')}
                          className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {authModalTab === 'login' && (loginRole === 'agent' ? 'Sign In as Agent / Landlord' : 'Sign In as Student')}
                        {authModalTab === 'student_signup' && 'Proceed to Student Dashboard'}
                        {authModalTab === 'agent_signup' && 'Proceed to Agent Dashboard'}
                        {authModalTab === 'forgot_password' && 'Send Password Reset Email'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
