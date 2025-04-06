import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import { LoginPopupProvider, useLoginPopup } from './contexts/LoginPopupContext';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SurveyBuilder from './pages/SurveyBuilder';
import SurveyList from './pages/SurveyList';
import SurveyResponse from './pages/SurveyResponse';
import ReportViewer from './pages/ReportViewer';
import AuthCallback from './pages/AuthCallback';

// Layout
import Layout from './components/Layout';
import './index.css';
import { useEffect } from 'react';

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { openLoginPopup } = useLoginPopup();

  useEffect(() => {
    console.log('isAuthenticated', isAuthenticated);

    if (!isAuthenticated && !isLoading) {
      openLoginPopup();
    }
  }, [isAuthenticated, isLoading, openLoginPopup]);

  if (!isAuthenticated) {
    // Hiển thị nội dung bị bảo vệ dưới dạng mờ hoặc chặn hoàn toàn
    return (
      <div className='relative'>
        <div className='absolute inset-0 bg-gray-100 bg-opacity-70 backdrop-blur-sm z-10 flex items-center justify-center'>
          <div className='text-center p-6 bg-white rounded-lg shadow-md'>
            <h2 className='text-xl font-bold mb-4'>Yêu cầu đăng nhập</h2>
            <p className='mb-4'>Vui lòng đăng nhập để truy cập nội dung này</p>
            <button
              className='px-4 py-2 bg-primary-500 text-white rounded-md'
              onClick={openLoginPopup}
            >
              Đăng nhập
            </button>
          </div>
        </div>
        <div className='opacity-30 pointer-events-none filter blur-sm'>{children}</div>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>
        <LoginPopupProvider>
          <Router>
            <Routes>
              <Route path='/auth/callback' element={<AuthCallback />} />

              <Route path='/' element={<Layout />}>
                <Route index element={<Home />} />
                <Route
                  path='/dashboard'
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/surveys'
                  element={
                    <ProtectedRoute>
                      <SurveyList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/surveys/create'
                  element={
                    <ProtectedRoute>
                      <SurveyBuilder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/surveys/:id/edit'
                  element={
                    <ProtectedRoute>
                      <SurveyBuilder />
                    </ProtectedRoute>
                  }
                />
                <Route path='/responses/:id' element={<SurveyResponse />} />
                <Route
                  path='/reports/:id'
                  element={
                    <ProtectedRoute>
                      <ReportViewer />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
            <Toaster position='top-right' />
          </Router>
        </LoginPopupProvider>
      </HeroUIProvider>
    </QueryClientProvider>
  );
}

export default App;
