import { FC } from 'react';

const SurveyLoadingSkeleton: FC = () => {
  return (
    <div className='min-h-screen bg-gray-50 py-10 px-4 md:px-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Skeleton Header */}
        <div className='mb-10'>
          <div className='h-10 w-64 bg-gray-200 rounded-md animate-pulse mb-3'></div>
          <div className='h-5 w-full max-w-2xl bg-gray-200 rounded-md animate-pulse'></div>
        </div>

        {/* Skeleton Action Bar */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
          <div className='flex gap-4 w-full md:w-auto'>
            <div className='h-10 w-full md:w-80 bg-gray-200 rounded-lg animate-pulse'></div>
            <div className='hidden md:block h-10 w-20 bg-gray-200 rounded-lg animate-pulse'></div>
          </div>
          <div className='h-10 w-full md:w-48 bg-gray-200 rounded-lg animate-pulse'></div>
        </div>

        {/* Skeleton Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className='h-72 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse'
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className='h-36 bg-gray-200'></div>
              <div className='p-5 space-y-3'>
                <div className='h-4 w-24 bg-gray-200 rounded-md'></div>
                <div className='h-6 w-5/6 bg-gray-200 rounded-md'></div>
                <div className='h-4 w-full bg-gray-200 rounded-md'></div>
                <div className='h-10 w-full bg-gray-200 rounded-md mt-6'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SurveyLoadingSkeleton;
