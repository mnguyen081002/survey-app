import { FC } from 'react';
import { Card, CardBody, Button, Chip, Tooltip } from '@heroui/react';
import { FiEdit, FiEye, FiTrash2, FiCalendar, FiCopy } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Survey } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface SurveyListItemProps {
  survey: Survey;
  isAuthenticated: boolean;
  onEdit: () => void;
  onViewResponses: () => void;
  onDelete: () => void;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
};

const SurveyListItem: FC<SurveyListItemProps> = ({
  survey,
  isAuthenticated,
  onEdit,
  onViewResponses,
  onDelete,
}) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/responses/${survey.id}`);
    toast.success('Đã copy link khảo sát vào clipboard');
  };

  return (
    <motion.div variants={itemVariants} whileHover={{ x: 5, transition: { duration: 0.2 } }}>
      <Card className='shadow-sm hover:shadow-md transition-shadow w-full mb-4 border border-gray-200'>
        <CardBody className='p-5'>
          <div className='flex flex-col md:flex-row gap-4 w-full'>
            <div className='w-full md:w-8/12'>
              <div className='flex items-center gap-2 mb-2'>
                {survey.isActive ? (
                  <Chip color='success' variant='flat' size='sm'>
                    <div className='flex items-center gap-2'>
                      Đang hoạt động
                      <div className='w-2 h-2 bg-success-500 rounded-full'></div>
                    </div>
                  </Chip>
                ) : (
                  <Chip color='warning' variant='flat' size='sm'>
                    Tạm dừng
                  </Chip>
                )}
                <span className='text-xs text-gray-500 flex items-center'>
                  <FiCalendar className='mr-1' />
                  {survey.createdAt ? formatDate(survey.createdAt) : 'Không xác định'}
                </span>
              </div>

              <h3 className='font-semibold text-lg mb-2'>{survey.title}</h3>
              <p className='text-gray-500 text-sm line-clamp-2 mb-2'>
                {survey.description || 'Không có mô tả'}
              </p>
            </div>

            <div className='w-full md:w-4/12 flex flex-row md:flex-col justify-between items-center md:items-end gap-4'>
              <div className='flex gap-2'>
                {isAuthenticated && (
                  <>
                    <Tooltip content='Chỉnh sửa khảo sát'>
                      <Button isIconOnly variant='light' onPress={onEdit} className='text-gray-600'>
                        <FiEdit />
                      </Button>
                    </Tooltip>
                    <Tooltip content='Xem kết quả'>
                      <Button
                        isIconOnly
                        variant='light'
                        onPress={onViewResponses}
                        className='text-gray-600'
                      >
                        <FiEye />
                      </Button>
                    </Tooltip>
                    <Tooltip content='Xóa khảo sát'>
                      <Button isIconOnly variant='light' color='danger' onPress={onDelete}>
                        <FiTrash2 />
                      </Button>
                    </Tooltip>
                  </>
                )}
              </div>

              <Button
                color='primary'
                variant='flat'
                startContent={<FiCopy />}
                radius='sm'
                onPress={handleCopyLink}
                className='font-medium hover:bg-primary-100 transition-colors'
              >
                Lấy link khảo sát
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default SurveyListItem;
