import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { surveysApi, Survey, PaginationParams } from '../services/api';

export const useSurveys = (isAuthenticated: boolean) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  
  const { data: response, isLoading } = useQuery({
    queryKey: ['surveys', isAuthenticated ? 'my' : 'active', page, limit],
    queryFn: async () => {
      const paginationParams: PaginationParams = { page, limit };
      const result = await surveysApi.getMySurveys(paginationParams);
      return result.data;
    },
  });

  
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

  
  const surveys = response?.data || [];
  const filteredSurveys = surveys.filter(
    (survey: Survey) =>
      survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  
  const meta = response?.meta;
  const totalPages = meta?.totalPages || 1;

  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSurvey = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khảo sát này?')) {
      deleteMutation.mutate(id);
    }
  };

  return {
    surveys: filteredSurveys,
    isLoading,
    page,
    totalPages,
    searchTerm,
    setSearchTerm,
    handlePageChange,
    handleDeleteSurvey,
  };
};
