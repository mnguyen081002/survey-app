import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardBody, CardHeader, Button, Chip } from '@heroui/react';
import { surveysApi, responsesApi, SurveyResponse } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiDownload, FiArrowLeft, FiCalendar, FiShare2 } from 'react-icons/fi';

import 'survey-analytics/survey.analytics.min.css';
import { Model } from 'survey-core';
import { VisualizationPanel } from 'survey-analytics';

// Import các component và tiện ích đã tách
import LoadingView from '../components/survey/LoadingView';
import NotFoundView from '../components/survey/NotFoundView';
import ReportTabs from '../components/survey/ReportTabs';
import { formatDateVN } from '../utils/formatters';
import { exportSurveyReport } from '../utils/documentUtils';

const ReportViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [responseCount, setResponseCount] = useState(0);
  const [aiSummary, setAiSummary] = useState<string | undefined>(undefined);
  const [isSummaryLoaded, setIsSummaryLoaded] = useState(false);
  const [vizPanel, setVizPanel] = useState<VisualizationPanel>();

  const { data: survey, isLoading: isLoadingSurvey } = useQuery({
    queryKey: ['survey', id],
    queryFn: () => surveysApi.getById(id || ''),
  });

  const { data: responses, isLoading: isLoadingResponses } = useQuery({
    queryKey: ['responses', id],
    queryFn: () => responsesApi.getBySurvey(id || ''),
    enabled: isAuthenticated && !!id,
  });

  const generateSummaryMutation = useMutation({
    mutationFn: (data: { surveyId: string }) => responsesApi.generateSummary(data),
    onSuccess: (response) => {
      setAiSummary(response.data.data.summary);
      setIsSummaryLoaded(true);
      toast.success('Đã tạo tóm tắt AI thành công');
    },
    onError: () => {
      toast.error('Không thể tạo tóm tắt AI. Vui lòng thử lại sau.');
    },
  });

  useEffect(() => {
    if (responses?.data?.meta) {
      setResponseCount(responses.data.meta.total);
    }
    if (survey?.data?.data) {
      setAiSummary(survey.data.data.aiSummary);
      setIsSummaryLoaded(!!survey.data.data.aiSummary);
    }
  }, [responses, survey]);

  useEffect(() => {
    if (
      survey?.data?.data &&
      responses?.data?.data &&
      responses.data.data.length > 0 &&
      !isLoadingSurvey &&
      !isLoadingResponses
    ) {
      try {
        const surveyJson = survey.data.data;
        const surveyModel = new Model(surveyJson);
        const responseData = getResponseAnswers(responses.data.data);

        const visualizationPanel = new VisualizationPanel(
          surveyModel.getAllQuestions(),
          responseData,
        );

        setVizPanel(visualizationPanel);
      } catch (error) {
        console.error('Error rendering SurveyJS Dashboard:', error);
        toast.error('Có lỗi khi hiển thị biểu đồ');
      }
    }
  }, [survey, responses, isLoadingSurvey, isLoadingResponses]);

  useEffect(() => {
    vizPanel?.render('surveyVizPanel');
    return () => {
      vizPanel?.clear();
    };
  }, [vizPanel]);

  const getResponseAnswers = (responseData: SurveyResponse[]) => {
    return responseData.reduce((acc: any, curr: SurveyResponse) => {
      return acc.concat(curr.answers);
    }, []);
  };

  const handleGenerateSummary = () => {
    if (!id || !responses?.data?.data || responses.data.data.length === 0) {
      toast.error('Không có dữ liệu để tạo tóm tắt');
      return;
    }

    generateSummaryMutation.mutate({ surveyId: id });
  };

  const handleExportReport = async () => {
    if (!survey || !responses) {
      toast.error('Không có dữ liệu để xuất báo cáo');
      return;
    }

    if (!survey.data.data.aiSummary) {
      generateSummaryMutation.mutate({
        surveyId: survey.data.data.id,
      });
    }

    const surveyData = survey.data.data;
    const responsesData = responses.data.data;
    const responseAnswers = getResponseAnswers(responsesData);

    exportSurveyReport(
      {
        surveyTitle: surveyData.title,
        surveyDescription: surveyData.description,
        aiSummary,
        questions: surveyData.questions,
        answers: responseAnswers,
      },
      `bao-cao-khao-sat-${id}.docx`,
      () => toast.success('Xuất báo cáo thành công'),
      () => toast.error('Không thể xuất báo cáo. Vui lòng thử lại sau.'),
    );
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã copy link khảo sát');
  };

  // Conditional rendering
  if (isLoadingSurvey || isLoadingResponses) {
    return <LoadingView />;
  }

  if (!survey || !responses) {
    return <NotFoundView />;
  }

  const surveyInfo = survey.data.data;

  return (
    <div className='container mx-auto py-8 px-4 max-w-6xl'>
      {/* Header navigation */}
      <div className='flex justify-between items-center mb-6'>
        <Button
          radius='sm'
          variant='light'
          onPress={() => navigate('/surveys')}
          startContent={<FiArrowLeft />}
        >
          Quay lại danh sách
        </Button>

        <div className='flex gap-2'>
          <Button
            radius='sm'
            variant='flat'
            startContent={<FiShare2 />}
            onPress={handleCopyShareLink}
          >
            Lấy link khảo sát
          </Button>
          <Button
            color='primary'
            radius='sm'
            startContent={<FiDownload />}
            isDisabled={responseCount === 0}
            className='shadow-sm'
            onPress={handleExportReport}
          >
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Main content */}
      <Card className='mb-6 shadow-md border border-gray-200'>
        <CardHeader className='flex flex-col gap-2 bg-gradient-to-r from-primary-50 to-white'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-2xl font-bold'>{surveyInfo.title}</h1>
              {surveyInfo.description && (
                <p className='text-gray-600 italic mt-1'>{surveyInfo.description}</p>
              )}
              <div className='flex items-center text-sm text-gray-500 mt-2'>
                <FiCalendar className='mr-1' />
                <span>Tạo ngày: {formatDateVN(surveyInfo.createdAt)}</span>
              </div>
            </div>
            <Chip size='lg' className='bg-white'>
              {responseCount} phản hồi
            </Chip>
          </div>
        </CardHeader>

        {/* Report Tabs */}
        <ReportTabs
          id={id || ''}
          responseCount={responseCount}
          surveyData={surveyInfo}
          responsesData={responses.data.data}
          aiSummary={aiSummary}
          isSummaryLoaded={isSummaryLoaded}
          isGeneratingSummary={generateSummaryMutation.isPending}
          onGenerateSummary={handleGenerateSummary}
          getResponseAnswers={getResponseAnswers}
        />
      </Card>
    </div>
  );
};

export default ReportViewer;
