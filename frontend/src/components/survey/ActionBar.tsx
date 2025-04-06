import { FC } from 'react';
import {
  Button,
  Input,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { FiSearch, FiPlus, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface ActionBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  isAuthenticated: boolean;
  onCreateSurvey: () => void;
}

const ActionBar: FC<ActionBarProps> = ({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  isAuthenticated,
  onCreateSurvey,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'
    >
      <div className='flex gap-4 w-full md:w-auto'>
        <Input
          placeholder='Tìm kiếm khảo sát...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startContent={<FiSearch className='text-gray-400' />}
          className='w-full md:w-80'
          isClearable
          onClear={() => setSearchTerm('')}
          classNames={{
            input: 'rounded-md',
            inputWrapper: 'rounded-md bg-white',
          }}
          size='md'
          radius='sm'
        />

        <div className='hidden md:flex border border-gray-200 rounded-lg bg-white overflow-hidden'>
          <Tooltip content='Xem dạng lưới'>
            <Button
              isIconOnly
              variant={viewMode === 'grid' ? 'solid' : 'light'}
              color={viewMode === 'grid' ? 'primary' : 'default'}
              onPress={() => setViewMode('grid')}
              className='rounded-none'
            >
              <FiGrid />
            </Button>
          </Tooltip>
          <Tooltip content='Xem dạng danh sách'>
            <Button
              isIconOnly
              variant={viewMode === 'list' ? 'solid' : 'light'}
              color={viewMode === 'list' ? 'primary' : 'default'}
              onPress={() => setViewMode('list')}
              className='rounded-none'
            >
              <FiList />
            </Button>
          </Tooltip>
        </div>

        <div className='flex md:hidden'>
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant='flat' className='bg-white shadow-sm'>
                <FiFilter className='text-gray-500' />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label='Tùy chọn hiển thị'>
              <DropdownItem
                key='grid'
                startContent={<FiGrid />}
                className={viewMode === 'grid' ? 'text-primary' : ''}
                onPress={() => setViewMode('grid')}
              >
                Xem dạng lưới
              </DropdownItem>
              <DropdownItem
                key='list'
                startContent={<FiList />}
                className={viewMode === 'list' ? 'text-primary' : ''}
                onPress={() => setViewMode('list')}
              >
                Xem dạng danh sách
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {isAuthenticated && (
        <Button
          color='primary'
          onPress={onCreateSurvey}
          startContent={<FiPlus className='text-white' />}
          className='font-medium shadow-md hover:shadow-lg transition-all w-full md:w-auto'
          size='md'
          radius='sm'
        >
          Tạo khảo sát mới
        </Button>
      )}
    </motion.div>
  );
};

export default ActionBar;
