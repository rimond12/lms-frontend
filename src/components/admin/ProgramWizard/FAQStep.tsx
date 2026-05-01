"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";

interface FAQ {
  _id?: string;
  question: string;
  answer: string;
  order?: number;
}

interface FAQStepProps {
  data: FAQ[];
  onUpdate: (data: FAQ[]) => void;
}

export const FAQStep: React.FC<FAQStepProps> = ({ data, onUpdate }) => {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const handleAddFAQ = () => {
    const newFAQ: FAQ = {
      question: "",
      answer: "",
      order: data.length,
    };
    onUpdate([...data, newFAQ]);
    setExpandedIndex(data.length);
  };

  const handleRemoveFAQ = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onUpdate(newData);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const handleUpdateFAQ = (index: number, field: keyof FAQ, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onUpdate(newData);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
            <HelpCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-500">
              Add common questions and answers for this course
            </p>
          </div>
        </div>
        <motion.button
          type="button"
          onClick={handleAddFAQ}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus size={18} />
          Add FAQ
        </motion.button>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {data.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
            >
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No FAQs added yet</p>
              <button
                type="button"
                onClick={handleAddFAQ}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                + Add your first FAQ
              </button>
            </motion.div>
          ) : (
            data.map((faq, index) => (
              <motion.div
                key={faq._id || index}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* FAQ Header */}
                <div
                  onClick={() => toggleExpand(index)}
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="cursor-grab text-gray-400">
                    <GripVertical size={20} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {faq.question || `Question ${index + 1}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFAQ(index);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  {expandedIndex === index ? (
                    <ChevronUp className="text-gray-400" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={20} />
                  )}
                </div>

                {/* FAQ Content (Expanded) */}
                <AnimatePresence>
                  {expandedIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-4 space-y-4 bg-gray-50">
                        {/* Question */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question *
                          </label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) =>
                              handleUpdateFAQ(index, "question", e.target.value)
                            }
                            placeholder="Enter the question..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Answer */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Answer *
                          </label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) =>
                              handleUpdateFAQ(index, "answer", e.target.value)
                            }
                            placeholder="Enter the answer..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      {data.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-700">
            <strong>Tip:</strong> Add common questions students ask about this
            course. Good FAQs can reduce confusion and help students make
            decisions.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default FAQStep;
