import { FC } from 'react';
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Divider,
  Tooltip,
} from '@heroui/react';
import {
  FiMoreVertical,
  FiEdit,
  FiEye,
  FiTrash2,
  FiArchive,
  FiCalendar,
  FiMessageSquare,
  FiCopy,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Survey } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface SurveyGridCardProps {
  survey: Survey;
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

const SurveyGridCard: FC<SurveyGridCardProps> = ({ survey, onEdit, onViewResponses, onDelete }) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/responses/${survey.id}`);
    toast.success('Đã copy link khảo sát vào clipboard');
  };

  return (
    <motion.div
      variants={itemVariants}
      className='h-full'
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className='h-full shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 bg-white'>
        <div className='relative bg-gradient-to-r from-primary-500/10 to-primary-500/20 p-2'>
          <div className='flex justify-between items-center'>
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant='light' size='sm' aria-label='More options'>
                  <FiMoreVertical size={20} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='Survey actions'>
                <DropdownItem
                  key='edit'
                  startContent={<FiEdit className='text-gray-500' />}
                  onPress={onEdit}
                >
                  Chỉnh sửa
                </DropdownItem>
                <DropdownItem
                  key='view-responses'
                  startContent={<FiEye className='text-gray-500' />}
                  onPress={onViewResponses}
                >
                  Xem kết quả
                </DropdownItem>
                <DropdownItem
                  key='delete'
                  className='text-danger'
                  color='danger'
                  startContent={<FiTrash2 />}
                  onPress={onDelete}
                >
                  Xóa khảo sát
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
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
          </div>
          <div className='h-36 flex items-center justify-center'>
            {survey.isActive ? (
              <FiMessageSquare className='w-10 h-10 text-primary-500' />
            ) : (
              <FiArchive className='w-10 h-10 text-gray-400' />
            )}
          </div>
        </div>
        <CardBody className='p-5'>
          <div className='mb-2 flex items-center gap-2'>
            <FiCalendar className='text-gray-400 w-4 h-4' />
            <span className='text-xs text-gray-500'>
              {survey.createdAt ? formatDate(survey.createdAt) : 'Không xác định'}
            </span>
          </div>

          <h3 className='font-semibold text-lg mb-2 line-clamp-2 text-gray-800'>{survey.title}</h3>
          <p className='text-gray-500 text-sm line-clamp-2 mb-4'>
            {survey.description || 'Không có mô tả'}
          </p>
        </CardBody>
        <Divider />
        <CardFooter className='px-5 py-4'>
          <Button
            color='primary'
            variant='flat'
            fullWidth
            startContent={<FiCopy />}
            radius='sm'
            onPress={handleCopyLink}
            className='font-medium hover:bg-primary-100 transition-colors'
          >
            Lấy link khảo sát
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SurveyGridCard;
