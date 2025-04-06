import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, CardHeader, Button, Spinner } from '@heroui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import 'survey-core/survey-core.css';
import 'survey-creator-core/survey-creator-core.css';
import { surveysApi, CreateSurveyDto, UpdateSurveyDto, Survey, Question } from '../services/api';

interface SaveFunctionCallback {
  (saveNo: string | number, success: boolean): void;
}

const SurveyBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<SurveyCreator | null>(null);
  const isEditMode = !!id;

  const { data: existingSurvey, isLoading: isLoadingSurvey } = useQuery({
    queryKey: ['survey', id],
    queryFn: () => surveysApi.getById(id || ''),
    enabled: isEditMode,
  });

  const createMutation = useMutation({
    mutationFn: surveysApi.create,
    onSuccess: (data) => {
      toast.success('Tạo survey thành công!');
      navigate(`/surveys/${data.data.data.id}/edit`);
    },
    onError: (error) => {
      toast.error('Không thể tạo survey. Vui lòng thử lại!');
      console.error('Create survey error:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSurveyDto }) =>
      surveysApi.update(id, data),
    onSuccess: () => {
      toast.success('Cập nhật survey thành công!');
    },
    onError: (error) => {
      toast.error('Không thể cập nhật survey. Vui lòng thử lại!');
      console.error('Update survey error:', error);
    },
  });

  useEffect(() => {
    const options = {
      showLogicTab: true,
      isAutoSave: false,
      isCollapsible: false,
    };

    const newCreator = new SurveyCreator(options);
    newCreator.locale = 'vi';
    newCreator.saveSurveyFunc = (saveNo: string | number, callback: SaveFunctionCallback) => {
      handleSaveSurvey({ saveNo, creator: newCreator });
      callback(saveNo, true);
    };

    setCreator(newCreator);
  }, []);

  useEffect(() => {
    if (creator && existingSurvey) {
      try {
        const surveyData = existingSurvey.data.data;
        if (surveyData.json) {
          creator.JSON = surveyData.json;
        } else {
          const json = {
            title: surveyData.title,
            description: surveyData.description,
            pages: [
              {
                name: 'page1',
                elements: surveyData.questions,
              },
            ],
          };
          creator.JSON = json;
        }
      } catch (e) {
        toast.error('Không thể đọc dữ liệu survey');
        console.error('Error parsing survey data:', e);
      }
    }
  }, [creator, existingSurvey]);

  const handleSaveSurvey = useCallback(
    ({ saveNo, creator }: { saveNo: string | number; creator: SurveyCreator }) => {
      if (!creator) return;

      try {
        const toastId = toast.loading('Đang lưu survey...');

        const surveyJSON = creator.JSON;
        const questions = surveyJSON.pages.flatMap(
          (page: any) => page.elements || [],
        ) as Question[];

        const surveyData: CreateSurveyDto = {
          title: surveyJSON.title || 'Untitled Survey',
          description: surveyJSON.description || '',
          questions,
          json: creator.JSON,
          isActive: true,
        };

        if (isEditMode && id) {
          updateMutation.mutate(
            { id, data: surveyData },
            {
              onSuccess: () => {
                toast.dismiss(toastId);
              },
              onError: () => {
                toast.dismiss(toastId);
              },
            },
          );
        } else {
          createMutation.mutate(surveyData, {
            onSuccess: () => {
              toast.dismiss(toastId);
            },
            onError: () => {
              toast.dismiss(toastId);
            },
          });
        }
      } catch (error) {
        toast.error('Survey không hợp lệ. Vui lòng kiểm tra lại!');
        console.error('Error parsing survey JSON:', error);
      }
    },
    [creator, isEditMode, id, updateMutation, createMutation],
  );

  if (isEditMode && isLoadingSurvey) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Spinner size='lg' label='Đang tải...' />
      </div>
    );
  }

  return (
    <div className='space-y-4 min-h-screen w-full'>
      {creator && (
        <div className='survey-creator w-full h-[calc(100vh-120px)]'>
          <SurveyCreatorComponent creator={creator} />
        </div>
      )}
    </div>
  );
};

export default SurveyBuilder;
