import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronDown, Clock } from "lucide-react";

interface Topic {
  _id?: string;
  title: string;
  description?: string;
  duration?: number;
  order?: number;
}

interface Curriculum {
  _id?: string;
  moduleTitle?: string;
  title?: string;
  description?: string;
  topics?: Topic[];
  lessons?: any[];
  order?: number;
}

interface CurriculumSectionProps {
  curriculum?: Curriculum[] | any[];
}

const CurriculumModule: React.FC<{
  module: Curriculum;
  index: number;
}> = ({ module, index }) => {
  const [expanded, setExpanded] = useState(index === 0);

  // Support both topics and lessons arrays
  const items = module.topics || (module as any).lessons || [];
  const totalDuration =
    items.reduce((sum: number, item: any) => sum + (item.duration || 0), 0) ||
    0;

  // Support both moduleTitle and title fields
  const moduleTitle =
    module.moduleTitle || (module as any).title || `Module ${index + 1}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Module Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 px-6 py-4 flex items-center justify-between transition-all"
      >
        <div className="text-left flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-lg">
              <BookOpen className="w-5 h-5 text-rose-50" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{moduleTitle}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {totalDuration > 0 && (
            <span className="flex items-center gap-1 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              <Clock className="w-4 h-4" />
              {totalDuration}min
            </span>
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Expanded Content - Description & Topics */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-200 bg-white"
        >
          {/* Module Description */}
          {module.description && (
            <div className="px-6 py-4 bg-gray-50 text-justify border-b border-gray-200">
              <p className="text-sm text-gray-600 leading-relaxed">
                {module.description}
              </p>
            </div>
          )}

          {/* Topics List */}
          <div className="divide-y divide-gray-200 text-justify">
            {items && items.length > 0 ? (
              items.map((topic: any, topicIndex: number) => (
                <motion.div
                  key={topic._id || topicIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: topicIndex * 0.05 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Topic Number */}
                    <div className="flex-shrink-0 w-7 h-7 bg-200 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {topicIndex + 1}
                    </div>

                    {/* Topic Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 mb-1">
                        {topic.title}
                      </h4>
                      {topic.description && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {topic.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-1 "> </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export const CurriculumSection: React.FC<CurriculumSectionProps> = ({
  curriculum = [],
}) => {
  if (!curriculum || curriculum.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Curriculum Coming Soon
        </h3>
        <p className="text-gray-600">
          The detailed curriculum will be available shortly
        </p>
      </div>
    );
  }

  const totalModules = curriculum.length;
  const totalTopics = curriculum.reduce(
    (sum, module) => sum + (module.topics?.length || 0),
    0,
  );
  const totalDuration = curriculum.reduce((sum, module) => {
    const items = module.topics || module.lessons || [];
    const moduleDuration = items.reduce(
      (t: number, item: any) => t + (item.duration || 0),
      0,
    );
    return sum + moduleDuration;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Curriculum Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-xs text-blue-700 font-semibold">Modules</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {totalModules}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-xs text-green-700 font-semibold">Topics</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {totalTopics}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <p className="text-xs text-purple-700 font-semibold">Duration</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {totalDuration}h
          </p>
        </div>
      </motion.div>

      {/* Modules List */}
      <div className="space-y-3">
        {curriculum.map((module, index) => (
          <CurriculumModule
            key={module._id || index}
            module={module}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default CurriculumSection;
