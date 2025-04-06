import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
  Divider,
  Spinner,
  Progress,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  ClockIcon,
  PencilSquareIcon,
  EyeIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { surveysApi } from '../services/api';
import { formatDate } from '../utils/formatters';
import { useState } from 'react';
import toast from 'react-hot-toast';

// Types
interface Survey {
  id: string;
  title: string;
  status: 'active' | 'inactive';
  responseCount: number;
  createdAt: string;
}

interface DashboardStats {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  completionRate: number;
  averageResponses: number;
  recentSurveys: Survey[];
}

// Components
const LoadingSpinner = () => (
  <div className='flex justify-center items-center h-96'>
    <Spinner size='lg' color='primary' label='Đang tải dữ liệu...' />
  </div>
);

const EmptyState = () => (
  <div className='flex flex-col items-center justify-center h-96 p-6 text-center'>
    <DocumentTextIcon className='w-16 h-16 text-gray-300 mb-4' />
    <h2 className='text-xl font-bold text-gray-700 mb-2'>Không có dữ liệu thống kê</h2>
    <p className='text-gray-500 mb-6 max-w-md'>
      Hiện chưa có dữ liệu khảo sát nào. Hãy tạo khảo sát đầu tiên của bạn để xem thống kê.
    </p>
    <Button
      as={Link}
      to='/surveys/create'
      color='primary'
      startContent={<PlusIcon className='w-4 h-4' />}
    >
      Tạo khảo sát mới
    </Button>
  </div>
);

const DashboardHeader = () => (
  <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-100 to-violet-100 p-6 rounded-md shadow-sm overflow-hidden'>
    <div>
      <h1 className='text-3xl font-bold text-gray-800'>Dashboard</h1>
      <p className='text-gray-600 mt-1'>Tổng quan về khảo sát và phản hồi</p>
    </div>
    <Button
      as={Link}
      to='/surveys/create'
      color='primary'
      startContent={<PlusIcon className='w-5 h-5' />}
      className='hover:bg-primary-600 transition-colors'
      radius='sm'
    >
      Tạo khảo sát mới
    </Button>
  </div>
);

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  color: string;
  extraContent?: React.ReactNode;
}

const StatCard = ({ title, value, icon, description, color, extraContent }: StatCardProps) => (
  <Card
    className={`border border-${color}-100 hover:border-${color}-300 transition-colors`}
    radius='sm'
  >
    <CardBody className='gap-2'>
      <div className='flex justify-between items-center'>
        <p className='text-gray-600 font-medium'>{title}</p>
        <div className={`p-2 bg-${color}-100 rounded-sm`}>{icon}</div>
      </div>
      <div className='flex items-end gap-2'>
        <p className='text-3xl font-bold'>{value}</p>
        <p className='text-sm text-gray-500 mb-1'>{description}</p>
      </div>
      {extraContent}
    </CardBody>
  </Card>
);

interface StatCardsProps {
  stats: DashboardStats;
}

const StatCards = ({ stats }: StatCardsProps) => (
  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
    <StatCard
      title='Tổng khảo sát'
      value={stats.totalSurveys}
      icon={<DocumentTextIcon className='w-6 h-6 text-blue-600' />}
      description='Khảo sát'
      color='blue'
      extraContent={
        <div className='flex items-center text-sm text-success'>
          <span className='text-success'>+{stats.activeSurveys} đang hoạt động</span>
        </div>
      }
    />

    <StatCard
      title='Tổng phản hồi'
      value={stats.totalResponses}
      icon={<UserGroupIcon className='w-6 h-6 text-purple-600' />}
      description='Phản hồi'
      color='purple'
      extraContent={
        <div className='flex items-center text-sm text-success'>
          <span className='text-success'>+{stats.totalResponses} đóng góp</span>
        </div>
      }
    />

    <StatCard
      title='Tỷ lệ hoàn thành'
      value={`${stats.completionRate}%`}
      icon={<ChartBarIcon className='w-6 h-6 text-green-600' />}
      description='Hoàn thành'
      color='green'
      extraContent={
        <Progress
          value={stats.completionRate}
          color='success'
          size='sm'
          aria-label='Tỷ lệ hoàn thành'
          className='mt-2'
          radius='sm'
        />
      }
    />

    <StatCard
      title='Trung bình phản hồi'
      value={Math.round(stats.averageResponses)}
      icon={<ArchiveBoxIcon className='w-6 h-6 text-amber-600' />}
      description='Phản hồi/Khảo sát'
      color='amber'
      extraContent={
        <div className='flex items-center text-sm'>
          <span className={stats.averageResponses > 50 ? 'text-success' : 'text-warning'}>
            {stats.averageResponses > 50 ? 'Hiệu quả cao' : 'Cần cải thiện'}
          </span>
        </div>
      }
    />
  </div>
);

interface SurveyTableRowProps {
  key: string;
  survey: Survey;
  onDelete?: (id: string) => void;
}

const SurveyTableRow = ({ survey, key, onDelete }: SurveyTableRowProps) => {
  console.log({ survey, key });

  // Xử lý khi nhấn nút xóa
  const handleDelete = () => {
    if (onDelete) {
      onDelete(survey.id);
    }
  };

  // Xử lý khi nhấn nút tải docx
  const handleDownloadDocx = () => {
    // API call để tải file docx
    window.open(`/api/surveys/${survey.id}/export/docx`, '_blank');
  };

  return (
    <TableRow key={key} className='hover:bg-gray-50'>
      <TableCell>
        <div className='flex items-center gap-2'>
          <DocumentTextIcon className='w-5 h-5 text-primary-500' />
          <span className='font-medium'>{survey.title}</span>
        </div>
      </TableCell>
      <TableCell>
        <Chip
          color={survey.status === 'active' ? 'success' : 'warning'}
          size='sm'
          variant='flat'
          radius='sm'
        >
          {survey.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
        </Chip>
      </TableCell>
      <TableCell>
        <div className='flex items-center gap-2'>
          <UserGroupIcon className='w-4 h-4 text-gray-500' />
          <span>{survey.responseCount}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className='flex items-center gap-2'>
          <ClockIcon className='w-4 h-4 text-gray-500' />
          <span>{formatDate(survey.createdAt)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className='flex gap-2 flex-wrap'>
          <Button
            as={Link}
            to={`/surveys/${survey.id}/edit`}
            size='sm'
            variant='flat'
            isIconOnly
            aria-label='Chỉnh sửa khảo sát'
            title='Chỉnh sửa khảo sát'
            startContent={<PencilSquareIcon className='w-4 h-4' />}
            radius='sm'
            className='hover:bg-gray-200 transition-colors'
          ></Button>
          <Button
            as={Link}
            to={`/reports/${survey.id}`}
            size='sm'
            color='primary'
            isIconOnly
            aria-label='Xem báo cáo'
            title='Xem báo cáo'
            startContent={<ChartBarIcon className='w-4 h-4' />}
            radius='sm'
            className='hover:bg-primary-600 transition-colors'
          ></Button>
          <Button
            size='sm'
            color='success'
            variant='flat'
            isIconOnly
            aria-label='Tải DOCX'
            title='Tải DOCX'
            startContent={<ArrowDownTrayIcon className='w-4 h-4' />}
            radius='sm'
            className='hover:bg-success-100 transition-colors'
            onPress={handleDownloadDocx}
          ></Button>
          <Button
            size='sm'
            color='danger'
            variant='flat'
            isIconOnly
            aria-label='Xóa khảo sát'
            title='Xóa khảo sát'
            startContent={<TrashIcon className='w-4 h-4' />}
            radius='sm'
            className='hover:bg-danger-100 transition-colors'
            onPress={handleDelete}
          ></Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const EmptySurveyTableRow = () => (
  <TableRow>
    <TableCell colSpan={5} className='text-center py-8'>
      <div className='flex flex-col items-center justify-center gap-2'>
        <DocumentTextIcon className='w-10 h-10 text-gray-300' />
        <p className='text-gray-500'>Không tìm thấy khảo sát nào</p>
        <Button
          as={Link}
          to='/surveys/create'
          size='sm'
          color='primary'
          startContent={<PlusIcon className='w-4 h-4' />}
          className='mt-2 hover:bg-primary-600 transition-colors'
          radius='sm'
        >
          Tạo khảo sát đầu tiên
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

interface RecentSurveysTableProps {
  surveys: Survey[];
  totalSurveys: number;
}

const RecentSurveysTable = ({ surveys, totalSurveys }: RecentSurveysTableProps) => {
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return surveysApi.delete(id);
    },
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard-stats'] });

      const previousData = queryClient.getQueryData(['dashboard-stats']);

      queryClient.setQueryData(['dashboard-stats'], (old: any) => {
        if (!old?.data?.data) return old;

        const newData = { ...old };
        newData.data.data.recentSurveys = newData.data.data.recentSurveys.filter(
          (survey: Survey) => survey.id !== deletedId,
        );
        newData.data.data.totalSurveys--;

        return newData;
      });

      return { previousData };
    },
    onSuccess: (_, deletedId) => {
      toast.success('Đã xóa khảo sát thành công');

      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      onClose();
    },
    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['dashboard-stats'], context.previousData);
      }
      console.error('Lỗi khi xóa khảo sát:', error);
      toast.error('Có lỗi xảy ra khi xóa khảo sát. Vui lòng thử lại sau.');
      onClose();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const handleDeleteSurvey = (id: string) => {
    setSurveyToDelete(id);
    onOpen();
  };

  const confirmDelete = () => {
    if (surveyToDelete) {
      deleteMutation.mutate(surveyToDelete);
    }
  };

  return (
    <>
      <Card className='border border-gray-200 hover:border-gray-300 transition-colors' radius='sm'>
        <CardHeader className='flex justify-between items-center'>
          <div>
            <h2 className='text-xl font-semibold'>Khảo sát gần đây</h2>
            <p className='text-sm text-gray-500'>Quản lý và xem báo cáo từ các khảo sát của bạn</p>
          </div>
          <Button
            as={Link}
            to='/surveys'
            variant='flat'
            color='primary'
            endContent={<EyeIcon className='w-4 h-4' />}
            className='text-sm hover:bg-primary-100 transition-colors'
            radius='sm'
          >
            Xem tất cả
          </Button>
        </CardHeader>
        <Divider />
        <CardBody>
          <Table aria-label='Recent surveys' radius='sm'>
            <TableHeader>
              <TableColumn>Tiêu đề</TableColumn>
              <TableColumn>Trạng thái</TableColumn>
              <TableColumn>Phản hồi</TableColumn>
              <TableColumn>Ngày tạo</TableColumn>
              <TableColumn>Thao tác</TableColumn>
            </TableHeader>
            <TableBody>
              {surveys && surveys.length > 0
                ? surveys.map((survey) =>
                    SurveyTableRow({ survey, key: survey.id, onDelete: handleDeleteSurvey }),
                  )
                : EmptySurveyTableRow()}
            </TableBody>
          </Table>
        </CardBody>
        <CardFooter className='flex justify-center'>
          <p className='text-sm text-gray-500'>
            Hiển thị {surveys?.length || 0} trong tổng số {totalSurveys || 0} khảo sát
          </p>
        </CardFooter>
      </Card>

      {/* Modal xác nhận xóa */}
      <Modal isOpen={isOpen} onClose={onClose} radius='sm' backdrop='blur'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>Xác nhận xóa</ModalHeader>
          <ModalBody>
            <p>Bạn có chắc chắn muốn xóa khảo sát này không?</p>
            <p className='text-gray-500 text-sm'>Hành động này không thể hoàn tác.</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color='default'
              radius='sm'
              variant='flat'
              onPress={onClose}
              className='hover:bg-gray-200 transition-colors'
            >
              Hủy
            </Button>
            <Button
              color='danger'
              radius='sm'
              onPress={confirmDelete}
              className='hover:bg-danger-600 transition-colors'
              isLoading={deleteMutation.isPending}
            >
              Xóa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// Main Component
const Dashboard = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const result = await surveysApi.getDashboardStats();
      return result.data;
    },
  });

  const stats = response?.data as DashboardStats | undefined;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!stats) {
    return <EmptyState />;
  }

  return (
    <div className='space-y-8 p-4'>
      <DashboardHeader />
      <StatCards stats={stats} />
      <RecentSurveysTable surveys={stats.recentSurveys} totalSurveys={stats.totalSurveys} />
    </div>
  );
};

export default Dashboard;
