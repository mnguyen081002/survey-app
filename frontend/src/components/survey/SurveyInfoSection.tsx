import { FC } from 'react';
import { Button } from '@heroui/react';
import { FiPlus, FiMessageSquare, FiEdit, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface SurveyInfoSectionProps {
  onCreateSurvey: () => void;
  isAuthenticated: boolean;
}

const SurveyInfoSection: FC<SurveyInfoSectionProps> = ({ onCreateSurvey, isAuthenticated }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className='mt-12 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'
    >
      <div className='p-6 md:p-8'>
        <h2 className='text-xl font-bold text-gray-800 mb-4'>Về Ứng dụng Khảo sát</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='flex flex-col'>
            <div className='mb-3 p-3 bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center'>
              <FiMessageSquare className='text-blue-500 w-6 h-6' />
            </div>
            <h3 className='font-semibold text-lg mb-2'>Tạo khảo sát</h3>
            <p className='text-gray-600 text-sm'>
              Dễ dàng tạo các khảo sát với nhiều loại câu hỏi khác nhau, từ trắc nghiệm đến câu hỏi
              mở.
            </p>
          </div>

          <div className='flex flex-col'>
            <div className='mb-3 p-3 bg-purple-50 rounded-full w-12 h-12 flex items-center justify-center'>
              <FiEye className='text-purple-500 w-6 h-6' />
            </div>
            <h3 className='font-semibold text-lg mb-2'>Thu thập phản hồi</h3>
            <p className='text-gray-600 text-sm'>
              Chia sẻ khảo sát của bạn và thu thập phản hồi từ người tham gia một cách hiệu quả.
            </p>
          </div>

          <div className='flex flex-col'>
            <div className='mb-3 p-3 bg-green-50 rounded-full w-12 h-12 flex items-center justify-center'>
              <FiEdit className='text-green-500 w-6 h-6' />
            </div>
            <h3 className='font-semibold text-lg mb-2'>Phân tích kết quả</h3>
            <p className='text-gray-600 text-sm'>
              Xem và phân tích kết quả khảo sát với biểu đồ trực quan và báo cáo chi tiết.
            </p>
          </div>
        </div>
      </div>

      <div className='px-6 md:px-8 py-4 bg-gray-50'>
        <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
          <p className='text-sm text-gray-500'>
            Bắt đầu tạo khảo sát đầu tiên của bạn để trải nghiệm tất cả tính năng.
          </p>
          {isAuthenticated && (
            <Button
              color='primary'
              onPress={onCreateSurvey}
              startContent={<FiPlus />}
              size='sm'
              radius='sm'
            >
              Tạo khảo sát
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SurveyInfoSection;
