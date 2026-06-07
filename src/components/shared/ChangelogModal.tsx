"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { changelogData } from "@/data/changelog";
import ReactMarkdown from "react-markdown";

interface ChangelogModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangelogModal = ({
  isOpen,
  onOpenChange,
}: ChangelogModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden !flex !flex-col bg-[#0a0a0a] border-gray-800 text-gray-200">
        <DialogHeader className="pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
            <DialogTitle className="text-xl font-bold text-white">
              What's New in Immigrant Jobs World
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400 text-sm mt-1">
            Latest updates, features, and improvements to your learning
            platform.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-[65vh] min-h-[300px]">
          <ScrollArea type="always" className="h-full pr-4 -mr-4">
            <div className="space-y-8 py-4">
              {changelogData.map((item, index) => (
                <div key={item.version} className="relative pl-6 pb-2">
                  {/* Timeline Line */}
                  {index !== changelogData.length - 1 && (
                    <div className="absolute left-[3px] top-3 bottom-[-32px] w-[2px] bg-gray-800"></div>
                  )}

                  {/* Timeline Dot */}
                  <div
                    className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ${index === 0 ? "bg-red-500 shadow-lg shadow-red-500/50" : "bg-gray-600"}`}
                  ></div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3
                        className={`text-lg font-bold tracking-tight ${index === 0 ? "text-white" : "text-gray-300"}`}
                      >
                        v{item.version}
                      </h3>
                      <Badge
                        variant={index === 0 ? "default" : "secondary"}
                        className={
                          index === 0
                            ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 shadow-sm shadow-red-900/20"
                            : "bg-gray-800/50 text-gray-400 border-gray-700/50"
                        }
                      >
                        {item.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 sm:mt-0">
                      <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded-md border border-gray-800">
                        {item.date}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 bg-gray-900/30 p-4 rounded-xl border border-gray-800/50">
                    <h4 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                      {item.title}
                    </h4>

                    <ul className="space-y-2">
                      {item.changes.map((change, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-400 leading-relaxed flex items-start gap-2"
                        >
                          <span className="text-gray-600 mt-1.5">•</span>
                          <span className="markdown-content">
                            <ReactMarkdown
                              components={{
                                strong: ({ ...props }) => (
                                  <span
                                    className="font-semibold text-gray-200"
                                    {...props}
                                  />
                                ),
                              }}
                            >
                              {change}
                            </ReactMarkdown>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          {/* Bottom Fade Gradient for Infinite Scroll Feel */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-[#0a0a0a] to-transparent pointer-events-none z-10"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
