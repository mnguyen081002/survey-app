import { FC } from 'react';
import { Button } from '@heroui/react';
import { FiPlus, FiMessageSquare } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface SurveyEmptyStateProps {
  searchTerm: string;
  isAuthenticated: boolean;
  onCreateSurvey: () => void;
}

const SurveyEmptyState: FC<SurveyEmptyStateProps> = ({
  searchTerm,
  isAuthenticated,
  onCreateSurvey,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='flex flex-col items-center justify-center py-16 px-4'
    >
      <div className='w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6'>
        <FiMessageSquare className='text-gray-400 w-10 h-10' />
      </div>
      <h3 className='text-xl font-semibold text-gray-800 mb-2'>Không tìm thấy khảo sát nào</h3>
      <p className='text-gray-500 mb-8 text-center max-w-md'>
        {searchTerm
          ? 'Không tìm thấy khảo sát nào phù hợp với từ khóa tìm kiếm. Vui lòng thử lại với từ khóa khác.'
          : isAuthenticated
          ? 'Bạn chưa có khảo sát nào. Tạo khảo sát đầu tiên của bạn ngay bây giờ!'
          : 'Hiện tại không có khảo sát nào đang hoạt động. Vui lòng quay lại sau.'}
      </p>
      <Button
        color='primary'
        size='lg'
        radius='sm'
        onPress={onCreateSurvey}
        startContent={<FiPlus className='text-white' />}
        className='font-medium shadow-lg hover:shadow-xl transition-all'
      >
        Tạo khảo sát mới
      </Button>
    </motion.div>
  );
};

export default SurveyEmptyState;
