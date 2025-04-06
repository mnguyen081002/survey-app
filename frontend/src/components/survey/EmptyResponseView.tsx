import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';

interface EmptyResponseViewProps {
  id: string;
}

/**
 * Component hiển thị khi không có phản hồi cho khảo sát
 */
const EmptyResponseView = ({ id }: EmptyResponseViewProps) => {
  const navigate = useNavigate();

  return (
    <div className='text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
      <h2 className='text-xl font-bold mb-4'>Chưa có phản hồi</h2>
      <p className='text-gray-600 mb-6'>Khảo sát này chưa nhận được phản hồi nào.</p>
      <Button color='primary' onPress={() => navigate(`/survey/${id}/share`)} className='mt-2'>
        Chia sẻ khảo sát
      </Button>
    </div>
  );
};

export default EmptyResponseView;
