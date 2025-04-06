import { motion } from 'framer-motion';

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <motion.div
      className='bg-white rounded-md p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all'
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
    >
      <div className='bg-primary/10 w-14 h-14 rounded-md flex items-center justify-center mb-4'>
        {icon}
      </div>
      <h3 className='text-xl font-bold mb-2'>{title}</h3>
      <p className='text-gray-600'>{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
