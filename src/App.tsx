import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { SearchFilters } from './components/SearchFilters';
import { StudentDashboard } from './components/StudentDashboard';
import { AgentDashboard } from './components/AgentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { OnboardingRoleSelect } from './components/OnboardingRoleSelect';
import { ListingDetailModal } from './components/ListingDetailModal';
import { InspectionModal } from './components/InspectionModal';
import { ReportModal } from './components/ReportModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { UserProfilePage } from './components/UserProfilePage';
import { BusinessVerificationPage } from './components/BusinessVerificationPage';
import { AiChatbot } from './components/AiChatbot';
import { ToastContainer } from './components/ToastContainer';
import { MobileBottomNav } from './components/MobileBottomNav';

const MainContent: React.FC = () => {
  const { activeView } = useAuth();

  return (
    <main className="flex-1 min-h-[80vh] pb-16 md:pb-0">
      {activeView === 'home' && <LandingPage />}
      {activeView === 'search' && <SearchFilters />}
      {activeView === 'saved' && <SearchFilters />}
      {activeView === 'profile' && <UserProfilePage />}
      {activeView === 'student_dashboard' && <StudentDashboard />}
      {activeView === 'agent_dashboard' && <AgentDashboard />}
      {activeView === 'agent_verification' && <BusinessVerificationPage />}
      {activeView === 'admin_dashboard' && <AdminDashboard />}
      {(activeView === 'role_select' || activeView === 'onboarding') && <OnboardingRoleSelect />}
    </main>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
          <Header />
          <MainContent />
          <Footer />

          {/* Mobile Bottom Docked Navigation */}
          <MobileBottomNav />

          {/* Global Modals & Utilities */}
          <ListingDetailModal />
          <InspectionModal />
          <ReportModal />
          <AuthModal />
          <UserProfileModal />
          <AiChatbot />
          <ToastContainer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
