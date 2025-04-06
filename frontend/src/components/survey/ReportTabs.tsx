import { Tabs, Tab, CardBody, Button, Spinner } from '@heroui/react';
import { FiBarChart2, FiUsers, FiZap } from 'react-icons/fi';
import { useState } from 'react';
import EmptyResponseView from './EmptyResponseView';
import { SurveyResponse } from '../../services/api';
import TableViewComponent from '../Tabulator';

interface ReportTabsProps {
  id: string;
  responseCount: number;
  surveyData: any;
  responsesData: SurveyResponse[];
  aiSummary?: string;
  isSummaryLoaded: boolean;
  isGeneratingSummary: boolean;
  onGenerateSummary: () => void;
  getResponseAnswers: (data: SurveyResponse[]) => any[];
}

/**
 * Component hiển thị tabs trong báo cáo
 */
const ReportTabs = ({
  id,
  responseCount,
  surveyData,
  responsesData,
  aiSummary,
  isSummaryLoaded,
  isGeneratingSummary,
  onGenerateSummary,
  getResponseAnswers,
}: ReportTabsProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderResponses = () => {
    if (!responsesData || responsesData.length === 0) {
      return (
        <div className='text-center py-10'>
          <h2 className='text-xl font-bold mb-4'>Chưa có phản hồi</h2>
          <p className='text-gray-600 mb-6'>Khảo sát này chưa nhận được phản hồi nào.</p>
        </div>
      );
    }

    return (
      <div className='space-y-6 mt-6'>
        <TableViewComponent
          surveyJson={surveyData}
          surveyResults={getResponseAnswers(responsesData)}
        />
      </div>
    );
  };

  return (
    <Tabs
      selectedKey={activeTab}
      onSelectionChange={(key) => setActiveTab(key as string)}
      classNames={{
        base: 'border-b border-gray-200',
        tabList: 'gap-0 w-full relative px-4 bg-gray-50/50',
      }}
    >
      {/* Dashboard Tab */}
      <Tab
        key='dashboard'
        title={
          <div className='flex items-center gap-1'>
            <FiBarChart2 />
            <span>Dashboard</span>
          </div>
        }
      >
        <CardBody className='p-0'>
          {responseCount === 0 ? (
            <div className='m-6'>
              <EmptyResponseView id={id} />
            </div>
          ) : (
            <div id='surveyVizPanel' />
          )}
        </CardBody>
      </Tab>

      {/* Responses Tab */}
      <Tab
        key='responses'
        title={
          <div className='flex items-center gap-1'>
            <FiUsers />
            <span>Phản hồi chi tiết</span>
          </div>
        }
      >
        <CardBody>
          {responseCount === 0 ? <EmptyResponseView id={id} /> : <>{renderResponses()}</>}
        </CardBody>
      </Tab>

      {/* AI Summary Tab */}
      <Tab
        key='ai-summary'
        title={
          <div className='flex items-center gap-1'>
            <FiZap />
            <span>Tóm tắt AI</span>
          </div>
        }
      >
        <CardBody>
          {responseCount === 0 ? (
            <EmptyResponseView id={id} />
          ) : (
            <div className='space-y-4'>
              {!surveyData.aiSummary && !isSummaryLoaded && !isGeneratingSummary ? (
                <div className='text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                  <h2 className='text-xl font-bold mb-4'>Tóm tắt AI</h2>
                  <p className='text-gray-600 mb-6'>
                    Sử dụng trí tuệ nhân tạo để tạo tóm tắt ý nghĩa từ các câu trả lời khảo sát.
                  </p>
                  <Button color='primary' onPress={onGenerateSummary} className='mt-2'>
                    Tạo tóm tắt AI
                  </Button>
                </div>
              ) : (
                <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
                  <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-bold flex items-center'>
                      <FiZap className='text-yellow-500 mr-2' /> Tóm tắt AI
                    </h2>
                    <Button
                      size='sm'
                      variant='light'
                      onPress={onGenerateSummary}
                      isLoading={isGeneratingSummary}
                    >
                      Tạo lại
                    </Button>
                  </div>

                  {isGeneratingSummary ? (
                    <div className='flex flex-col items-center justify-center py-8'>
                      <Spinner color='primary' className='mb-4' />
                      <p className='text-gray-600'>Đang tạo tóm tắt AI...</p>
                    </div>
                  ) : (
                    <div className='prose prose-lg max-w-none'>
                      <p>{aiSummary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Tab>
    </Tabs>
  );
};

export default ReportTabs;
