import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button } from '@heroui/react';

/**
 * Component hiển thị khi không tìm thấy dữ liệu
 */
const NotFoundView = () => {
  const navigate = useNavigate();

  return (
    <Card className='max-w-lg mx-auto mt-10'>
      <CardBody>
        <div className='text-center py-10'>
          <h2 className='text-xl font-bold mb-4'>Không tìm thấy dữ liệu</h2>
          <p className='text-gray-600 mb-6'>Không thể tải thông tin khảo sát hoặc câu trả lời.</p>
          <Button color='primary' onPress={() => navigate('/surveys')}>
            Quay lại danh sách khảo sát
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default NotFoundView;
