import { Spinner } from '@heroui/react';

/**
 * Component hiển thị khi đang tải dữ liệu
 */
const LoadingView = () => (
  <div className='flex justify-center items-center h-screen bg-gray-50'>
    <div className='text-center'>
      <Spinner size='lg' color='primary' className='mb-4' />
      <p className='text-gray-600'>Đang tải báo cáo khảo sát...</p>
    </div>
  </div>
);

export default LoadingView;
