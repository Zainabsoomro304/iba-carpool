import React, { useState } from 'react';
import { User, PageView } from './types';
import { Layout } from './components/Layout';
import { Login, Signup, ForgotPassword } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { PostRide, BrowseRides, MyRides, MyRequests } from './components/Rides';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<PageView>('login');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  const renderContent = () => {
    if (!currentUser) {
      if (currentPage === 'signup') return <Signup onLoginSuccess={handleLogin} onNavigate={setCurrentPage} />;
      if (currentPage === 'forgot-password') return <ForgotPassword onNavigate={setCurrentPage} />;
      return <Login onLoginSuccess={handleLogin} onNavigate={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={currentUser} onNavigate={setCurrentPage} />;
      case 'post-ride':
        return <PostRide user={currentUser} onNavigate={setCurrentPage} />;
      case 'browse-rides':
        return <BrowseRides user={currentUser} />;
      case 'my-rides':
        return <MyRides user={currentUser} />;
      case 'my-requests':
        return <MyRequests user={currentUser} />;
      default:
        return <Dashboard user={currentUser} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;