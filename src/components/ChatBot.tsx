'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ChatInterface from './ChatInterface';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[360px] h-[540px] bg-white rounded-lg shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 bg-[#0078D4] text-white rounded-t-lg">
              <div>
                <h3 className="text-lg font-semibold">Tipsiti Assistant</h3>
                <p className="text-sm opacity-90">Your local discovery guide</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <ChatInterface />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-[#0078D4] text-white p-3 rounded-full shadow-lg hover:bg-[#106EBE] transition-colors"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default ChatBot; 