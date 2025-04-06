import { useState } from 'react';
import { Button } from '@heroui/react';
import { Link, Navigate } from 'react-router-dom';
import { FiBarChart2, FiClipboard, FiUsers, FiCheckCircle, FiLogIn } from 'react-icons/fi';
import { motion } from 'framer-motion';
import LoginPopup from '../components/LoginPopUp';
import { useAuth } from '../contexts/AuthContext';
import FeatureCard from '../components/home/FeatureCard';

const Home = () => {
  const [isLoginPopupOpen, setLoginPopupOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const openLoginPopup = () => {
    setLoginPopupOpen(true);
  };

  const closeLoginPopup = () => {
    setLoginPopupOpen(false);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isAuthenticated) {
    return <Navigate to='/surveys' />;
  }

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Hero Section */}
      <section className='relative bg-gradient-to-br from-primary-100 via-blue-50 to-white pt-24 pb-16 md:pt-32 md:pb-24'>
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute left-1/2 top-0 -translate-x-1/2 opacity-20'>
            <svg width='800' height='800' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
              <circle
                cx='50'
                cy='50'
                r='40'
                stroke='currentColor'
                strokeWidth='8'
                fill='none'
                className='text-primary opacity-20'
              />
              <path
                d='M50,10 L50,90 M10,50 L90,50'
                stroke='currentColor'
                strokeWidth='6'
                className='text-primary opacity-20'
              />
            </svg>
          </div>
        </div>

        <div className='container mx-auto px-4 relative z-10'>
          <motion.div
            className='max-w-3xl mx-auto text-center space-y-6'
            initial='hidden'
            animate='visible'
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            <motion.h1
              className='text-4xl md:text-6xl font-bold text-gray-900 leading-tight'
              variants={fadeInUp}
            >
              Nền tảng khảo sát <span className='text-primary'>thông minh</span>
            </motion.h1>

            <motion.p
              className='text-lg md:text-xl text-gray-600 max-w-2xl mx-auto'
              variants={fadeInUp}
            >
              Tạo, quản lý và phân tích khảo sát một cách dễ dàng. Thu thập ý kiến và thấu hiểu đối
              tượng của bạn với nền tảng khảo sát mạnh mẽ.
            </motion.p>

            <motion.div
              className='flex flex-col sm:flex-row gap-4 justify-center pt-4'
              variants={fadeInUp}
            >
              <Button
                onPress={openLoginPopup}
                color='primary'
                size='lg'
                radius='sm'
                className='font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-105 transition-all'
                startContent={<FiLogIn />}
              >
                Đăng nhập
              </Button>
              <Button
                as={Link}
                to='/surveys'
                variant='bordered'
                size='lg'
                radius='sm'
                className='font-semibold border-2 hover:bg-gray-50 transition-all'
                startContent={<FiClipboard />}
              >
                Xem khảo sát
              </Button>
            </motion.div>

            <motion.div className='pt-8' variants={fadeInUp}>
              <div className='bg-white/80 backdrop-blur-sm p-3 rounded-md inline-block shadow-lg'>
                <div className='flex gap-2 items-center'>
                  <div className='w-3 h-3 rounded-full bg-primary animate-pulse'></div>
                  <p className='text-sm font-medium text-gray-600'>
                    Đã có <span className='font-bold text-primary'>1,234+</span> khảo sát được tạo
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-16 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold mb-4'>Tại sao chọn nền tảng của chúng tôi?</h2>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              Giải pháp khảo sát toàn diện giúp bạn thu thập, phân tích và hiểu sâu về ý kiến người
              dùng
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <FeatureCard
              icon={<FiClipboard className='w-7 h-7 text-primary' />}
              title='Dễ dàng tạo khảo sát'
              description='Giao diện kéo thả trực quan giúp bạn tạo khảo sát chuyên nghiệp chỉ trong vài phút.'
            />
            <FeatureCard
              icon={<FiUsers className='w-7 h-7 text-primary' />}
              title='Thu thập ý kiến'
              description='Chia sẻ khảo sát qua nhiều kênh và dễ dàng theo dõi lượng phản hồi theo thời gian thực.'
            />
            <FeatureCard
              icon={<FiBarChart2 className='w-7 h-7 text-primary' />}
              title='Phân tích dữ liệu'
              description='Biểu đồ trực quan và báo cáo chi tiết giúp bạn đưa ra quyết định dựa trên dữ liệu.'
            />
          </div>
        </div>
      </section>

      {/* Call-to-action Section */}
      <section className='py-16 bg-gradient-to-br from-primary-50 to-blue-50'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl font-bold mb-6'>Sẵn sàng tạo khảo sát đầu tiên?</h2>
          <p className='text-gray-600 max-w-2xl mx-auto mb-8'>
            Chỉ mất vài phút để bắt đầu. Đăng ký miễn phí ngay hôm nay và khám phá sức mạnh của nền
            tảng khảo sát của chúng tôi.
          </p>
          <Button
            onPress={openLoginPopup}
            color='primary'
            size='lg'
            className='font-semibold px-8 shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-105 transition-all'
          >
            Đăng ký miễn phí
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-white py-8 border-t border-gray-100'>
        <div className='container mx-auto px-4 text-center text-gray-500 text-sm'>
          <p>© 2025 Survey Platform. Bản quyền thuộc về chúng tôi.</p>
        </div>
      </footer>

      <LoginPopup isOpen={isLoginPopupOpen} onClose={closeLoginPopup} />
    </div>
  );
};

export default Home;
