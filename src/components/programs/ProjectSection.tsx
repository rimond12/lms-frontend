"use client";

import React from "react";
import { motion } from "framer-motion";
import { FolderOpen, ExternalLink } from "lucide-react";
import AppImage from "@/components/ui/AppImage";

interface Project {
  _id?: string;
  title?: string;
  description?: string;
  image?: string;
}

interface ProjectSectionProps {
  projects?: Project[];
  onProjectClick?: (projectId: string) => void;
}

const ProjectCard: React.FC<{
  project: Project;
  index: number;
  onProjectClick?: (projectId: string) => void;
}> = ({ project, index, onProjectClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Image Section */}
        <div className="relative w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
          {project.image ? (
            <AppImage
              photoUrl={project.image}
              alt={project.title || "Project"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              width={300}
              height={300}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
              <FolderOpen className="w-16 h-16 text-blue-300" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge */}
          <div className="absolute top-3 right-3 bg-blue-800 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Project
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-800 transition-colors">
            {project.title || "Untitled Project"}
          </h3>

          {/* Description */}
          {project.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {project.description}
            </p>
          )}

          {!project.description && (
            <p className="text-sm text-gray-400 mb-4 italic">
              No description provided
            </p>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100">
          <button
            onClick={() => onProjectClick?.(project._id || "")}
            className="w-full bg-gradient-to-r from-blue-800 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn text-sm"
          >
            <span>View Project</span>
            <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const ProjectSection: React.FC<ProjectSectionProps> = ({
  projects = [],
  onProjectClick,
}) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Projects Coming Soon
        </h3>
        <p className="text-gray-600">Course projects will be available soon</p>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FolderOpen className="w-5 h-5 text-blue-800" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {projects.length} {projects.length === 1 ? "Project" : "Projects"}{" "}
            in This Course
          </h2>
        </div>
        <p className="text-gray-600 ml-11">
          Hands-on projects to apply your learning
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <ProjectCard
            key={project._id || index}
            project={project}
            index={index}
            onProjectClick={onProjectClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectSection;
