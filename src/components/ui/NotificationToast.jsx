import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import clsx from 'clsx';

const icons = {
  success: <CheckCircle className="text-green-500" />,
  error: <XCircle className="text-red-500" />,
  warning: <AlertTriangle className="text-yellow-500" />,
  info: <Info className="text-blue-500" />,
};

export default function NotificationToast({ type, message }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.3 }}
        className={clsx(
          'fixed bottom-6 right-6 z-50 max-w-sm w-full shadow-xl rounded-2xl flex items-center gap-4 px-5 py-4',
          'border border-opacity-30 backdrop-blur-md',
          'bg-white/90 dark:bg-neutral-800/90',
          'font-medium text-sm',
        )}
      >
        <div>{icons[type] || icons.info}</div>
        <p className="text-neutral-800 dark:text-neutral-100 font-custom">{message}</p>
      </motion.div>
    </AnimatePresence>
  );
}
