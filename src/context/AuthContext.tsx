import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Listing, University, NotificationItem } from '../types';
import { INITIAL_NOTIFICATIONS, INITIAL_UNIVERSITIES } from '../data/mockData';
import { 
  auth, 
  onAuthStateChanged, 
  loginWithGoogle, 
  registerWithEmail, 
  loginWithEmail, 
  logoutFirebase, 
  resetFirebasePassword, 
  resendFirebaseEmailVerification,
  checkFirebaseEmailVerified,
  fetchFirestoreUserProfile, 
  updateFirestoreUserProfile, 
  requestFCMNotificationPermission, 
  subscribeToFCMIncomingMessages, 
  subscribeFirestoreNotifications, 
  markNotificationReadInFirestore 
} from '../lib/firebase';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  login: (email: string, role: UserRole, name?: string) => void;
  loginGoogleOAuth: (preferredRole?: UserRole) => Promise<void>;
  signUpEmailFirebase: (email: string, pass: string, name: string, role: UserRole, extra?: Partial<User>) => Promise<void>;
  signInEmailFirebase: (email: string, pass: string) => Promise<void>;
  resetPasswordFirebase: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkVerificationStatus: () => Promise<boolean>;
  logout: () => void;
  savedAccounts: User[];
  switchAccount: (userId: string) => void;
  deleteAccount: (userId: string) => void;
  updateProfile: (updatedData: Partial<User>) => void;
  isProfileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  savedListingIds: string[];
  toggleSaveListing: (id: string) => void;
  isSaved: (id: string) => boolean;
  selectedUniversity: University | null;
  setSelectedUniversity: (uni: University | null) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedInfoDocId: string;
  setSelectedInfoDocId: (docId: string) => void;
  selectedListing: Listing | null;
  setSelectedListing: (listing: Listing | null) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'student_signup' | 'agent_signup' | 'admin_login' | 'forgot_password' | 'email_verification_sent';
  setAuthModalTab: (tab: 'login' | 'student_signup' | 'agent_signup' | 'admin_login' | 'forgot_password' | 'email_verification_sent') => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  togglePinNotification: (id: string) => void;
  clearAllNotifications: () => void;
  toasts: ToastMessage[];
  addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  inspectionModalListing: Listing | null;
  setInspectionModalListing: (listing: Listing | null) => void;
  reportModalListing: Listing | null;
  setReportModalListing: (listing: Listing | null) => void;
  agentActiveTab: 'listings' | 'add_wizard' | 'special_requests' | 'phone_requests' | 'crm_inspections' | 'analytics' | 'verification';
  setAgentActiveTab: (tab: 'listings' | 'add_wizard' | 'special_requests' | 'phone_requests' | 'crm_inspections' | 'analytics' | 'verification') => void;
  requestNotificationPermission: () => Promise<void>;
  isFirebaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_ACCOUNTS_PRESET: User[] = [
  {
    id: 'stud_001',
    email: 'tunde.b@student.unilag.edu.ng',
    name: 'Tunde Bakare',
    role: 'student',
    universityId: 'uni_unilag',
    universityName: 'University of Lagos',
    phone: '+234 812 345 6789',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    createdAt: '2025-09-01T08:00:00Z',
  },
  {
    id: 'agent_001',
    email: 'chidi.properties@campora.africa',
    name: 'Chidi Okonkwo (Prime Hostels)',
    role: 'agent',
    phone: '+234 803 123 4567',
    isVerifiedAgent: true,
    verificationStatus: 'verified',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'admin_001',
    email: 'admin@campora.africa',
    name: 'Campora Platform Admin',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    createdAt: '2024-11-01T00:00:00Z',
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('guest');
  const [user, setUser] = useState<User | null>(null);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  const [savedAccounts, setSavedAccounts] = useState<User[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('campora_saved_accounts');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return INITIAL_ACCOUNTS_PRESET;
  });

  const [savedListingIds, setSavedListingIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('campora_saved_listings');
      return saved ? JSON.parse(saved) : ['list_001', 'list_003'];
    }
    return ['list_001', 'list_003'];
  });

  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(INITIAL_UNIVERSITIES[0]);
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedInfoDocId, setSelectedInfoDocId] = useState<string>('terms-and-conditions');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'student_signup' | 'agent_signup' | 'admin_login' | 'forgot_password' | 'email_verification_sent'>('login');
  
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [inspectionModalListing, setInspectionModalListing] = useState<Listing | null>(null);
  const [reportModalListing, setReportModalListing] = useState<Listing | null>(null);
  const [agentActiveTab, setAgentActiveTab] = useState<'listings' | 'add_wizard' | 'special_requests' | 'phone_requests' | 'crm_inspections' | 'analytics' | 'verification'>('listings');

  useEffect(() => {
    localStorage.setItem('campora_saved_listings', JSON.stringify(savedListingIds));
  }, [savedListingIds]);

  useEffect(() => {
    localStorage.setItem('campora_saved_accounts', JSON.stringify(savedAccounts));
  }, [savedAccounts]);

  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const switchAccount = (userId: string) => {
    const targetUser = savedAccounts.find(u => u.id === userId);
    if (!targetUser) {
      addToast('Account not found', 'Unable to find specified account', 'error');
      return;
    }
    setUser(targetUser);
    setRoleState(targetUser.role);
    if (targetUser.role === 'student') setActiveView('student_dashboard');
    else if (targetUser.role === 'agent') setActiveView('agent_dashboard');
    else if (targetUser.role === 'admin') setActiveView('admin_dashboard');
    addToast('Account Switched', `Now logged in as ${targetUser.name} (${targetUser.role})`, 'success');
  };

  const deleteAccount = (userId: string) => {
    const target = savedAccounts.find(u => u.id === userId);
    const targetName = target ? target.name : 'Account';

    setSavedAccounts(prev => prev.filter(u => u.id !== userId));

    if (user?.id === userId) {
      setUser(null);
      setRoleState('guest');
      setActiveView('home');
      addToast('Account Deleted', `${targetName} was permanently deleted. You are now in guest mode.`, 'warning');
    } else {
      addToast('Account Deleted', `${targetName} has been removed from saved accounts.`, 'info');
    }
  };

  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);

  // 1. Firebase Auth listener & Firestore User Profile fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      if (fUser) {
        let profile = await fetchFirestoreUserProfile(fUser.uid);
        if (!profile) {
          profile = {
            id: fUser.uid,
            email: fUser.email || '',
            name: fUser.displayName || 'Campora User',
            role: 'student',
            avatar: fUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            createdAt: new Date().toISOString(),
            emailVerified: fUser.emailVerified || false,
          };
        } else {
          profile = {
            ...profile,
            emailVerified: fUser.emailVerified || profile.emailVerified || false,
          };
        }
        setUser(profile);
        setRoleState(profile.role);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Firebase Cloud Messaging foreground push notification listener
  useEffect(() => {
    const unsubscribeFCM = subscribeToFCMIncomingMessages((payload) => {
      if (payload?.notification) {
        addToast(
          payload.notification.title || 'Push Notification (Firebase FCM)', 
          payload.notification.body, 
          'info'
        );
      }
    });
    return () => unsubscribeFCM();
  }, []);

  // 3. Real-time Notifications subscription from Firestore
  useEffect(() => {
    if (!user) return;
    const unsubscribeNotifs = subscribeFirestoreNotifications(user.id, (notifs) => {
      if (notifs.length > 0) {
        setNotifications(notifs);
      }
    });
    return () => unsubscribeNotifs();
  }, [user]);

  const requestNotificationPermission = async () => {
    const token = await requestFCMNotificationPermission(user?.id);
    if (token) {
      addToast('Cloud Messaging Enabled', 'Firebase Push Notifications activated for this browser!', 'success');
    } else {
      addToast('Notification Permission', 'Browser notifications set or permission denied', 'info');
    }
  };

  const loginGoogleOAuth = async (preferredRole?: UserRole) => {
    try {
      const fUser = await loginWithGoogle(preferredRole || 'student');
      const profile = await fetchFirestoreUserProfile(fUser.uid);
      const userRole = profile?.role || preferredRole || 'student';
      
      setUser(profile || {
        id: fUser.uid,
        email: fUser.email || '',
        name: fUser.displayName || 'Campora User',
        role: userRole,
        avatar: fUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        createdAt: new Date().toISOString(),
        isVerifiedAgent: userRole === 'agent',
      });
      setRoleState(userRole);

      addToast('Signed In with Google (Firebase OAuth)', `Welcome ${fUser.displayName || fUser.email}! (${userRole.toUpperCase()})`, 'success');
      setAuthModalOpen(false);

      if (userRole === 'student') setActiveView('search');
      else if (userRole === 'agent') {
        if (preferredRole === 'agent' && !profile?.isVerifiedAgent) {
          setActiveView('agent_verification');
        } else {
          setActiveView('agent_dashboard');
        }
      }
      else if (userRole === 'admin') setActiveView('admin_dashboard');
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      addToast('Google Auth Error', err.message || 'Failed to authenticate with Google OAuth', 'error');
    }
  };

  const signUpEmailFirebase = async (email: string, pass: string, name: string, userRole: UserRole, extra: Partial<User> = {}) => {
    try {
      const newUser = await registerWithEmail(email, pass, name, userRole, extra);
      setUser(newUser);
      setRoleState(newUser.role);
      addToast('Verification Email Dispatched ✉️', `Check ${email} to verify your account legitimacy.`, 'info');
      setAuthModalTab('email_verification_sent');

      if (userRole === 'student') setActiveView('search');
      else if (userRole === 'agent') setActiveView('agent_verification');
      else if (userRole === 'admin') setActiveView('admin_dashboard');
    } catch (err: any) {
      console.error('Firebase Email Registration Error:', err);
      addToast('Registration Failed', err.message || 'Error creating Firebase user', 'error');
      throw err;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      await resendFirebaseEmailVerification();
      addToast('Verification Link Sent ✉️', 'A new verification email has been sent to your inbox.', 'info');
    } catch (err: any) {
      addToast('Resend Failed', err.message || 'Unable to resend verification email.', 'error');
    }
  };

  const checkVerificationStatus = async (): Promise<boolean> => {
    try {
      const verified = await checkFirebaseEmailVerified();
      if (verified) {
        if (user) {
          const updated = { ...user, emailVerified: true };
          setUser(updated);
          await updateFirestoreUserProfile(user.id, { emailVerified: true });
        }
        addToast('Email Verified! ✅', 'Your account email has been verified successfully.', 'success');
        return true;
      } else {
        addToast('Pending Verification', 'Email verification not completed yet. Please check your inbox and click the link.', 'warning');
        return false;
      }
    } catch (err: any) {
      console.error('Error checking verification:', err);
      return false;
    }
  };

  const signInEmailFirebase = async (email: string, pass: string) => {
    try {
      const fUser = await loginWithEmail(email, pass);
      const profile = await fetchFirestoreUserProfile(fUser.uid);
      const targetRole = profile?.role || 'student';
      
      setUser(profile || {
        id: fUser.uid,
        email: fUser.email || email,
        name: fUser.displayName || 'Campora User',
        role: targetRole,
        avatar: fUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        createdAt: new Date().toISOString()
      });
      setRoleState(targetRole);

      addToast('Signed In (Firebase Auth)', `Welcome back!`, 'success');
      setAuthModalOpen(false);

      if (targetRole === 'student') setActiveView('search');
      else if (targetRole === 'agent') setActiveView('agent_dashboard');
      else if (targetRole === 'admin') setActiveView('admin_dashboard');
    } catch (err: any) {
      console.error('Firebase Sign In Error:', err);
      addToast('Sign In Failed', err.message || 'Invalid credentials or account error', 'error');
      throw err;
    }
  };

  const resetPasswordFirebase = async (email: string) => {
    try {
      await resetFirebasePassword(email);
      addToast('Reset Email Sent', `Firebase password reset link sent to ${email}`, 'info');
    } catch (err: any) {
      addToast('Reset Failed', err.message || 'Failed to send reset email', 'error');
    }
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    setSavedAccounts(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    
    // Also update in Firestore if user is logged in
    updateFirestoreUserProfile(user.id, updatedData).catch(() => {});
    addToast('Profile Updated', 'Your profile details have been saved to Firestore successfully.');
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'guest') {
      setUser(null);
    } else if (newRole === 'student') {
      const studentAcc = savedAccounts.find(a => a.role === 'student') || INITIAL_ACCOUNTS_PRESET[0];
      setUser(studentAcc);
      addToast('Switched Role to Student', `Browsing as student user ${studentAcc.name}`, 'info');
    } else if (newRole === 'agent') {
      const agentAcc = savedAccounts.find(a => a.role === 'agent') || INITIAL_ACCOUNTS_PRESET[1];
      setUser(agentAcc);
      addToast('Switched Role to Agent', `Logged in as property agent ${agentAcc.name}`, 'info');
    } else if (newRole === 'admin') {
      const adminAcc = savedAccounts.find(a => a.role === 'admin') || INITIAL_ACCOUNTS_PRESET[2];
      setUser(adminAcc);
      addToast('Switched Role to Admin', 'Accessing platform management dashboard', 'warning');
    }
  };

  const login = (email: string, targetRole: UserRole, name?: string) => {
    setRoleState(targetRole);
    const existing = savedAccounts.find(a => a.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      setUser(existing);
      setRoleState(existing.role);
      addToast('Logged In Successfully', `Welcome back, ${existing.name}!`, 'success');
    } else {
      const newUserId = `usr_${Date.now()}`;
      const displayName = name || (targetRole === 'agent' ? 'Property Agent' : 'Student Scholar');
      const newUserObj: User = {
        id: newUserId,
        email,
        name: displayName,
        role: targetRole,
        isVerifiedAgent: targetRole === 'agent',
        verificationStatus: targetRole === 'agent' ? 'verified' : 'none',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        createdAt: new Date().toISOString(),
      };

      setUser(newUserObj);
      setSavedAccounts(prev => [newUserObj, ...prev]);
      addToast('Account Created & Added', `Welcome ${displayName}! Account added to profile accounts.`, 'success');
    }

    setAuthModalOpen(false);

    if (targetRole === 'student') {
      setActiveView('search');
    } else if (targetRole === 'agent') {
      setActiveView('agent_dashboard');
    } else if (targetRole === 'admin') {
      setActiveView('admin_dashboard');
    }

    const confirmNotif: NotificationItem = {
      id: `notif_confirm_${Date.now()}`,
      userId: email,
      type: 'announcement',
      title: 'Check Email to Confirm Account',
      body: `A confirmation email has been sent to ${email}. Please check your inbox or spam folder to complete registration.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [confirmNotif, ...prev]);
  };

  const logout = () => {
    logoutFirebase().catch(() => {});
    setRoleState('guest');
    setUser(null);
    setActiveView('home');
    addToast('Signed Out', 'You have signed out of Firebase and are now browsing as a guest.', 'info');
  };

  const toggleSaveListing = (id: string) => {
    setSavedListingIds(prev => {
      const exists = prev.includes(id);
      if (exists) {
        addToast('Removed from Saved', 'Listing removed from your bookmarks', 'info');
        return prev.filter(item => item !== id);
      } else {
        addToast('Saved Listing!', 'Added to your bookmarked listings', 'success');
        return [...prev, id];
      }
    });
  };

  const isSaved = (id: string) => savedListingIds.includes(id);

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    markNotificationReadInFirestore(id).catch(() => {});
  };

  const togglePinNotification = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        const isPinned = !n.pinned;
        addToast(isPinned ? 'Notification Pinned 📌' : 'Notification Unpinned', undefined, 'info');
        return { ...n, pinned: isPinned };
      }
      return n;
    }));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('Notifications marked as read', undefined, 'info');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        login,
        loginGoogleOAuth,
        signUpEmailFirebase,
        signInEmailFirebase,
        resetPasswordFirebase,
        resendVerificationEmail,
        checkVerificationStatus,
        logout,
        savedAccounts,
        switchAccount,
        deleteAccount,
        updateProfile,
        isProfileModalOpen,
        setProfileModalOpen,
        savedListingIds,
        toggleSaveListing,
        isSaved,
        selectedUniversity,
        setSelectedUniversity,
        activeView,
        setActiveView,
        selectedInfoDocId,
        setSelectedInfoDocId,
        selectedListing,
        setSelectedListing,
        isAuthModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        notifications,
        unreadCount,
        markNotificationRead,
        togglePinNotification,
        clearAllNotifications,
        toasts,
        addToast,
        removeToast,
        inspectionModalListing,
        setInspectionModalListing,
        reportModalListing,
        setReportModalListing,
        agentActiveTab,
        setAgentActiveTab,
        requestNotificationPermission,
        isFirebaseConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
