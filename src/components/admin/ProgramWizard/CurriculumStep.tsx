"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, AlertCircle } from "lucide-react";

interface Topic {
  title: string;
  description: string;
}

interface Curriculum {
  moduleTitle: string;
  description: string;
  topics: Topic[];
}

interface CurriculumStepProps {
  data: Curriculum[];
  onUpdate: (data: Curriculum[]) => void;
}

/**
 * Step 2: Curriculum Management
 * Manages modules and topics matching backend schema exactly
 * Backend expects: moduleName, description, objectives (array), order, duration
 * Topics are converted to objectives for the backend
 */
export const CurriculumStep: React.FC<CurriculumStepProps> = ({
  data,
  onUpdate,
}) => {
  const addModule = () => {
    onUpdate([
      ...data,
      {
        moduleTitle: "",
        description: "",
        topics: [],
      },
    ]);
  };

  const updateModule = (idx: number, module: Curriculum) => {
    const newData = [...data];
    newData[idx] = module;
    onUpdate(newData);
  };

  const deleteModule = (idx: number) => {
    onUpdate(data.filter((_, i) => i !== idx));
  };

  const addTopic = (moduleIdx: number) => {
    const newData = [...data];
    newData[moduleIdx].topics.push({
      title: "",
      description: "",
    });
    onUpdate(newData);
  };

  const updateTopic = (
    moduleIdx: number,
    topicIdx: number,
    field: string,
    value: any,
  ) => {
    const newData = [...data];
    (newData[moduleIdx].topics[topicIdx] as any)[field] = value;
    onUpdate(newData);
  };

  const removeTopic = (moduleIdx: number, topicIdx: number) => {
    const newData = [...data];
    newData[moduleIdx].topics.splice(topicIdx, 1);
    onUpdate(newData);
  };

  // Validate module has required fields (topics are optional)
  const isModuleValid = (module: Curriculum): boolean => {
    return module.moduleTitle.trim().length > 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Modules List */}
      {data.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No modules added yet</p>
          <button
            onClick={addModule}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} />
            Create First Module
          </button>
        </div>
      ) : (
        data.map((module, moduleIdx) => (
          <motion.div
            key={moduleIdx}
            className={`border-2 rounded-lg p-5 transition-all ${
              isModuleValid(module)
                ? "border-purple-300 hover:border-purple-400 hover:shadow-md"
                : "border-orange-300 hover:border-orange-400 bg-orange-50"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Module Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Module {moduleIdx + 1}
                </h3>
                {!isModuleValid(module) && (
                  <div className="flex items-center gap-1 text-xs text-orange-700 mt-1">
                    <AlertCircle size={14} /> Incomplete - fill all fields
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteModule(moduleIdx)}
                className="flex items-center gap-1 text-red-800 hover:text-red-700 font-medium text-sm transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>

            {/* Module Details */}
            <div className="space-y-3 mb-5 pb-5 border-b border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Module Title <span className="text-red-800">*</span>
                </label>
                <input
                  type="text"
                  value={module.moduleTitle}
                  onChange={(e) =>
                    updateModule(moduleIdx, {
                      ...module,
                      moduleTitle: e.target.value,
                    })
                  }
                  placeholder="e.g., Introduction to React"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Description
                </label>
                <textarea
                  value={module.description}
                  onChange={(e) =>
                    updateModule(moduleIdx, {
                      ...module,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of this module"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                />
              </div>
            </div>

            {/* Topics Section */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">
                  Topics ({module.topics.length})
                </h4>
              </div>

              {module.topics.length === 0 ? (
                <div className="bg-gray-50 rounded p-3 text-center text-sm text-gray-600">
                  No topics added yet
                </div>
              ) : (
                <div className="space-y-2 mb-3">
                  {module.topics.map((topic, topicIdx) => (
                    <motion.div
                      key={topicIdx}
                      className="bg-white p-3 rounded border border-gray-200 hover:border-purple-300 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={topic.title}
                            onChange={(e) =>
                              updateTopic(
                                moduleIdx,
                                topicIdx,
                                "title",
                                e.target.value,
                              )
                            }
                            placeholder="Topic title"
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm mb-2 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                          />
                          <textarea
                            value={topic.description}
                            onChange={(e) =>
                              updateTopic(
                                moduleIdx,
                                topicIdx,
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Topic description"
                            rows={2}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none transition-all"
                          />
                        </div>
                        <button
                          onClick={() => removeTopic(moduleIdx, topicIdx)}
                          className="ml-2 text-red-800 hover:text-red-700 flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <button
                onClick={() => addTopic(moduleIdx)}
                className="w-full py-2 text-purple-600 hover:text-purple-700 text-sm font-medium border border-dashed border-purple-300 rounded hover:bg-purple-50 transition-colors"
              >
                + Add Topic
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mt-4">
              <p className="text-xs text-blue-900">
                <span className="font-medium">✓ Backend Compliant:</span> Module
                will be added via{" "}
                <code className="text-blue-700">
                  POST /api/programs/:id/curriculum
                </code>{" "}
                endpoint with moduleName, description, and objectives.
              </p>
            </div>
          </motion.div>
        ))
      )}

      {/* Add Module Button */}
      <button
        onClick={addModule}
        className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors"
      >
        + Add Module
      </button>
    </motion.div>
  );
};

export default CurriculumStep;
