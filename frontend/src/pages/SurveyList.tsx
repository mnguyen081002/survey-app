import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pagination } from '@heroui/react';

import { surveysApi, Survey, PaginationParams } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import ActionBar from '../components/survey/ActionBar';
import SurveyGridCard from '../components/survey/SurveyGridCard';
import SurveyListItem from '../components/survey/SurveyListItem';
import SurveyEmptyState from '../components/survey/SurveyEmptyState';
import SurveyLoadingSkeleton from '../components/survey/SurveyLoadingSkeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const SurveyList = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const queryClient = useQueryClient();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const { data: response, isLoading: isLoadingSurveys } = useQuery({
    queryKey: ['surveys', isAuthenticated ? 'my' : 'active', page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const paginationParams: PaginationParams = {
        page,
        limit,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      };
      const result = await surveysApi.getMySurveys(paginationParams);
      return result.data;
    },
  });

  useEffect(() => {
    if (response && initialLoading) {
      setInitialLoading(false);
    }
  }, [response, initialLoading]);

  const deleteMutation = useMutation({
    mutationFn: surveysApi.delete,
    onSuccess: (response) => {
      toast.success(response.data.message || 'Đã xóa khảo sát thành công!');
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xóa khảo sát!');
    },
  });

  const meta = response?.meta;
  const totalPages = meta?.totalPages || 1;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateSurvey = () => {
    navigate('/surveys/create');
  };

  const handleDeleteSurvey = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khảo sát này?')) {
      deleteMutation.mutate(id);
    }
  };

  const renderSurveyList = () => {
    if (!initialLoading && isLoadingSurveys) {
      return (
        <div className='mt-6'>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {Array.from({ length: limit }).map((_, index) => (
              <div key={index} className='bg-white rounded-lg shadow-sm p-4 animate-pulse'>
                <div className='h-8 bg-gray-200 rounded mb-4'></div>
                <div className='h-24 bg-gray-100 rounded mb-3'></div>
                <div className='h-6 bg-gray-200 rounded w-1/2'></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!isLoadingSurveys && response?.data?.length === 0) {
      return (
        <SurveyEmptyState
          searchTerm={searchTerm}
          isAuthenticated={isAuthenticated}
          onCreateSurvey={handleCreateSurvey}
        />
      );
    }

    if (!isLoadingSurveys && response?.data) {
      return (
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {response.data.map((survey: Survey) =>
            viewMode === 'grid' ? (
              <SurveyGridCard
                key={survey.id}
                survey={survey}
                onEdit={() => navigate(`/surveys/${survey.id}/edit`)}
                onViewResponses={() => navigate(`/reports/${survey.id}`)}
                onDelete={() => handleDeleteSurvey(survey.id)}
              />
            ) : (
              <SurveyListItem
                key={survey.id}
                survey={survey}
                isAuthenticated={isAuthenticated}
                onEdit={() => navigate(`/surveys/${survey.id}/edit`)}
                onViewResponses={() => navigate(`/reports/${survey.id}`)}
                onDelete={() => handleDeleteSurvey(survey.id)}
              />
            ),
          )}
        </motion.div>
      );
    }

    return null;
  };

  // Render loading state cho toàn bộ trang khi mới khởi tạo
  if (initialLoading && isLoadingSurveys) {
    return <SurveyLoadingSkeleton />;
  }

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-4 md:px-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-10'
        >
          <h1 className='text-3xl font-bold text-gray-800 mb-3'>
            {isAuthenticated ? 'Khảo sát của tôi' : 'Khảo sát hiện có'}
          </h1>
          <p className='text-gray-600 max-w-2xl'>
            {isAuthenticated
              ? 'Quản lý tất cả khảo sát của bạn, theo dõi phản hồi và tạo khảo sát mới.'
              : 'Khám phá các khảo sát đang hoạt động và tham gia đóng góp ý kiến của bạn.'}
          </p>
        </motion.div>

        {/* Action Bar */}
        <ActionBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isAuthenticated={isAuthenticated}
          onCreateSurvey={handleCreateSurvey}
        />

        {/* Survey List - Chỉ phần này được reload khi tìm kiếm */}
        {renderSurveyList()}

        {/* Pagination */}
        {response?.data && response?.data.length > 0 && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className='flex justify-center mt-12'
          >
            <Pagination
              total={totalPages}
              initialPage={page}
              page={page}
              onChange={handlePageChange}
              color='primary'
              showControls
              className='overflow-visible'
              size='lg'
              radius='sm'
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SurveyList;
