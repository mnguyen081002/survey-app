import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '@heroui/react';
import { userApi } from '../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Lấy các tham số từ URL
    const fetch = async () => {
      const r = await userApi.getProfile();

      if (r) {
        // Tạo user data từ thông tin nhận được
        const userData = {
          id: 'google_' + Date.now(), // ID tạm thời nếu không có ID thực
          email: r.data.data.email,
          name: r.data.data.name || 'User',
          picture: r.data.data.picture || null,
        };

        // Đăng nhập với context
        login(userData);

        // Chuyển hướng người dùng về trang chính
        navigate('/dashboard');
      } else {
        console.error('Invalid auth callback data');
        navigate('/');
      }
    };

    fetch();
  }, []);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
      <Spinner size='lg' color='primary' />
      <p className='mt-4 text-gray-600'>Đang xử lý đăng nhập...</p>
    </div>
  );
};

export default AuthCallback;
