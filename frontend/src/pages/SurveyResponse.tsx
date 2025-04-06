import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Spinner } from '@heroui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Model } from 'survey-core';
import { Survey as SurveyComponent } from 'survey-react-ui';
import 'survey-core/survey-core.css';
import { surveysApi, responsesApi, Survey, CreateResponseDto } from '../services/api';
import toast from 'react-hot-toast';
import { PlainLight } from 'survey-core/themes';
const SurveyResponse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Model | null>(null);

  // Truy vấn dữ liệu survey
  const { data: surveyData, isLoading } = useQuery({
    queryKey: ['survey', id],
    queryFn: () => surveysApi.getById(id || ''),
  });

  // Mutation để gửi câu trả lời
  const submitMutation = useMutation({
    mutationFn: responsesApi.submit,
    onSuccess: () => {
      toast.success('Cảm ơn bạn đã hoàn thành khảo sát!');
      navigate('/');
    },
    onError: () => {
      toast.error('Có lỗi khi gửi câu trả lời. Vui lòng thử lại!');
    },
  });

  // Khởi tạo Survey Model khi dữ liệu được tải về
  useEffect(() => {
    if (surveyData) {
      let json;
      try {
        json = surveyData.data.data.json;
        console.log(json);

        const surveyModel = new Model(json);
        surveyModel.applyTheme(PlainLight);
        surveyModel.onComplete.add((sender) => {
          const results = sender.data;
          const responseData: CreateResponseDto = {
            surveyId: id || '',
            answers: results,
          };

          submitMutation.mutate(responseData);
        });

        setSurvey(surveyModel);
      } catch (error) {
        console.error('Error parsing survey JSON:', error);
        toast.error('Không thể tải khảo sát. Định dạng không hợp lệ.');
      }
    }
  }, [surveyData, id]);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Spinner size='lg' label='Đang tải khảo sát...' />
      </div>
    );
  }

  if (!surveyData) {
    return (
      <Card className='max-w-lg mx-auto mt-10'>
        <CardBody>
          <div className='text-center py-10'>
            <h2 className='text-xl font-bold mb-4'>Không tìm thấy khảo sát</h2>
            <p className='text-gray-600 mb-6'>Khảo sát này không tồn tại hoặc đã bị xóa.</p>
            <Button color='primary' onPress={() => navigate('/surveys')}>
              Quay lại danh sách khảo sát
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      {survey && (
        <div className='survey-container'>
          <SurveyComponent model={survey} />
        </div>
      )}
    </div>
  );
};

export default SurveyResponse;
