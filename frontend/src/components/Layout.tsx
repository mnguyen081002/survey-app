import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoginPopup } from '../contexts/LoginPopupContext';
import LoginPopup from './LoginPopUp';
import { useEffect } from 'react';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { isLoginPopupOpen, openLoginPopup, closeLoginPopup } = useLoginPopup();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar maxWidth='full' isBordered className='shadow-md w-full py-2 max-w-full'>
        <div className='w-full flex justify-between'>
          <div className='flex items-center gap-6'>
            <NavbarBrand>
              <Link
                href='/'
                className='font-bold text-2xl text-primary-600 flex items-center gap-2'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='w-7 h-7'
                >
                  <path d='M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z' />
                  <path d='M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z' />
                </svg>
                Survey Platform
              </Link>
            </NavbarBrand>

            <NavbarContent className='hidden sm:flex'>
              <NavbarItem isActive={location.pathname.includes('/surveys')}>
                <Link
                  href='/surveys'
                  color={location.pathname.includes('/surveys') ? 'primary' : 'foreground'}
                  className='font-semibold text-lg'
                >
                  Surveys
                </Link>
              </NavbarItem>
              <NavbarItem isActive={location.pathname.includes('/dashboard')}>
                <Link
                  href='/dashboard'
                  color={location.pathname.includes('/dashboard') ? 'primary' : 'foreground'}
                  className='font-semibold text-lg'
                >
                  Dashboard
                </Link>
              </NavbarItem>
            </NavbarContent>
          </div>

          <NavbarContent justify='end'>
            {isAuthenticated ? (
              <Dropdown>
                <DropdownTrigger>
                  <Avatar
                    src={user?.picture || undefined}
                    name={user?.name || 'User'}
                    className='cursor-pointer'
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label='User menu'>
                  <DropdownItem key='profile' textValue='Profile'>
                    <div className='py-2 flex flex-col'>
                      <span className='font-semibold'>{user?.name}</span>
                      <span className='text-sm text-gray-500'>{user?.email}</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem key='dashboard' onPress={() => navigate('/dashboard')}>
                    Bảng điều khiển
                  </DropdownItem>
                  <DropdownItem key='surveys' onPress={() => navigate('/surveys')}>
                    Quản lý khảo sát
                  </DropdownItem>
                  <DropdownItem key='logout' color='danger' onPress={handleLogout}>
                    Đăng xuất
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <NavbarItem>
                <Button
                  color='primary'
                  className='font-medium'
                  radius='sm'
                  onPress={openLoginPopup}
                >
                  Đăng nhập
                </Button>
              </NavbarItem>
            )}
          </NavbarContent>
        </div>
      </Navbar>

      <main className='flex-1 w-full'>
        <Outlet />
      </main>

      <LoginPopup isOpen={isLoginPopupOpen} onClose={closeLoginPopup} />
    </div>
  );
};

export default Layout;
