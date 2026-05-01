"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  useGetMainCategoriesQuery,
  useGetCategoryHierarchyQuery,
} from "@/app/redux/api/CategoryApi/CategoryApi";
import { ICategory } from "@/types/category";
import {
  Folder,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  LayoutGrid,
} from "lucide-react";
import AppImage from "@/components/ui/AppImage";

interface CategoryTabsProps {
  /** Currently selected category ID */
  selectedCategory: string | null;
  /** Currently selected sub-category ID */
  selectedSubCategory: string | null;
  /** Callback when category is selected */
  onCategoryChange: (categoryId: string | null) => void;
  /** Callback when sub-category is selected */
  onSubCategoryChange: (subCategoryId: string | null) => void;
  /** Visual style variant */
  variant?: "tabs" | "pills" | "minimal" | "modern" | "clean" | "premium";
  /** Show sub-categories when a category is selected */
  showSubCategories?: boolean;
  /** Show category icons/photos */
  showIcons?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * CategoryTabs Component
 * A flexible category filter component that displays main categories as tabs
 * and optionally shows sub-categories when a category is selected.
 */
const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  selectedSubCategory,
  onCategoryChange,
  onSubCategoryChange,
  variant = "pills",
  showSubCategories = true,
  showIcons = true,
  className,
}) => {
  // Fetch categories with hierarchy for nested data
  const {
    data: hierarchyData,
    isLoading,
    error,
  } = useGetCategoryHierarchyQuery();

  // Get main categories with their sub-categories
  const categories = useMemo(() => {
    if (!hierarchyData?.data) return [];
    return hierarchyData.data;
  }, [hierarchyData]);

  // Get sub-categories for selected main category
  const subCategories = useMemo(() => {
    if (!selectedCategory || !categories.length) return [];
    const mainCategory = categories.find((cat) => cat._id === selectedCategory);
    return mainCategory?.subCategories || [];
  }, [selectedCategory, categories]);

  // Handle category selection
  const handleCategoryClick = (categoryId: string | null) => {
    if (categoryId === selectedCategory) {
      // Clicking same category clears selection
      onCategoryChange(null);
      onSubCategoryChange(null);
    } else {
      onCategoryChange(categoryId);
      onSubCategoryChange(null); // Clear sub-category when changing main category
    }
  };

  // Handle sub-category selection
  const handleSubCategoryClick = (subCategoryId: string | null) => {
    if (subCategoryId === selectedSubCategory) {
      onSubCategoryChange(null);
    } else {
      onSubCategoryChange(subCategoryId);
    }
  };

  // Style variants
  const tabStyles = {
    tabs: {
      container: "border-b border-gray-800",
      list: "flex justify-center items-center overflow-x-auto gap-1 -mb-px scrollbar-hide",
      item: "px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-3 transition-all",
      itemActive: "border-[#1a4da1] text-[#1a4da1] bg-blue-50/30",
      itemInactive:
        "border-transparent text-gray-700 hover:text-black hover:border-gray-400",
    },
    pills: {
      container: "bg-gray-100 rounded-xl p-2",
      list: "flex justify-center flex-wrap gap-2",
      item: "px-5 py-2.5 text-sm font-semibold rounded-lg transition-all",
      itemActive: "bg-[#1a4da1] text-white shadow-md",
      itemInactive:
        "text-gray-700 bg-white hover:text-black hover:bg-gray-50 border border-gray-200",
    },
    minimal: {
      container: "",
      list: "flex justify-center flex-wrap gap-3",
      item: "px-4 py-2 text-sm font-semibold rounded-full transition-all",
      itemActive: "bg-[#1a4da1] text-white shadow-sm",
      itemInactive:
        "text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-300",
    },
    modern: {
      container: "w-full",
      list: "flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide p-1",
      item: "relative px-5 py-2.5 text-sm font-medium rounded-full transition-all isolate shrink-0",
      itemActive: "text-white",
      itemInactive:
        "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900",
    },
    clean: {
      container: "w-full",
      list: "flex items-center gap-1 overflow-x-auto scrollbar-hide p-1",
      item: "relative px-4 py-2 text-sm font-bold rounded-lg transition-all shrink-0 flex items-center gap-2",
      itemActive: "bg-[#1a4da1] text-white shadow-md shadow-blue-100",
      itemInactive: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    },
    premium: {
      container: "w-full py-2",
      list: "flex items-center gap-3 overflow-x-auto scrollbar-hide p-1",
      item: "group relative px-6 py-3 text-[15px] font-bold rounded-2xl transition-all duration-300 border bg-white shrink-0 shadow-sm hover:shadow-md flex items-center gap-2.5",
      itemActive:
        "border-[#1a4da1] text-[#1a4da1] ring-2 ring-blue-100 ring-offset-2 shadow-blue-100",
      itemInactive:
        "border-gray-200 text-gray-600 hover:border-blue-200 hover:text-[#1a4da1]",
    },
  };

  const styles = tabStyles[variant];

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="w-6 h-6 text-[#1a4da1] animate-spin" />
        <span className="ml-2 text-sm font-medium text-gray-700">
          Loading categories...
        </span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center py-4 text-gray-500 gap-2",
          className,
        )}
      >
        <AlertCircle className="w-5 h-5 text-[#1a4da1]" />
        <span className="text-sm">Unable to load categories</span>
      </div>
    );
  }

  // Empty state
  if (!categories.length) {
    return null; // Don't render if no categories
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Categories */}
      <div className={styles.container}>
        <div className={styles.list}>
          {/* All Categories option */}
          <button
            onClick={() => handleCategoryClick(null)}
            className={cn(
              styles.item,
              "flex items-center gap-2",
              variant !== "modern" &&
                (!selectedCategory ? styles.itemActive : styles.itemInactive),
            )}
          >
            {variant === "modern" && !selectedCategory && (
              <motion.div
                layoutId="activeCategoryTab"
                className="absolute inset-0 bg-[#1a4da1] rounded-full -z-10 shadow-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <LayoutGrid
              className={cn(
                "w-4 h-4",
                variant === "modern" && !selectedCategory ? "text-white" : "",
              )}
            />
            <span
              className={cn(
                variant === "modern" && !selectedCategory ? "text-white" : "",
              )}
            >
              All
            </span>
          </button>

          {/* Category Items */}
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className={cn(
                styles.item,
                "flex items-center gap-2",
                variant !== "modern" &&
                  (selectedCategory === category._id
                    ? styles.itemActive
                    : styles.itemInactive),
              )}
            >
              {variant === "modern" && selectedCategory === category._id && (
                <motion.div
                  layoutId="activeCategoryTab"
                  className="absolute inset-0 bg-[#1a4da1] rounded-full -z-10 shadow-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Category Icon/Photo */}
              {showIcons && (
                <>
                  {category.photoUrl ? (
                    <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                      <AppImage
                        photoUrl={category.photoUrl}
                        alt={category.name}
                        width={20}
                        height={20}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : category.icon ? (
                    <span className="text-base">{category.icon}</span>
                  ) : (
                    <Folder
                      className={cn(
                        "w-4 h-4",
                        variant === "modern" &&
                          selectedCategory === category._id
                          ? "text-white"
                          : "",
                      )}
                      style={
                        variant !== "modern" &&
                        selectedCategory !== category._id
                          ? { color: category.color || "#9333ea" }
                          : {}
                      }
                    />
                  )}
                </>
              )}

              {/* Category Name */}
              <span
                className={cn(
                  "font-semibold",
                  variant === "modern" && selectedCategory === category._id
                    ? "text-white"
                    : "",
                )}
              >
                {category.shortName || category.name}
              </span>

              {/* Course Count Badge */}
              {category.courseCount !== undefined &&
                category.courseCount > 0 && (
                  <span
                    className={cn(
                      "ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full",
                      variant === "modern" && selectedCategory === category._id
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-gray-200",
                    )}
                  >
                    {category.courseCount}
                  </span>
                )}

              {/* Sub-category indicator */}
              {showSubCategories &&
                category.subCategories &&
                category.subCategories.length > 0 && (
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 transition-transform",
                      selectedCategory === category._id && "rotate-180",
                      variant === "modern" && selectedCategory === category._id
                        ? "text-white"
                        : "",
                    )}
                  />
                )}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Categories (shown when a main category is selected) */}
      {showSubCategories && selectedCategory && subCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex flex-wrap gap-2 px-1",
            variant === "modern" ? "justify-start" : "justify-center",
          )}
        >
          {/* All sub-categories option */}
          <button
            onClick={() => handleSubCategoryClick(null)}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 border-2",
              !selectedSubCategory
                ? "bg-black text-white border-black shadow-md"
                : "text-gray-700 border-gray-300 hover:border-black hover:bg-gray-50",
            )}
          >
            <ChevronRight className="w-3.5 h-3.5" />
            All{" "}
            {categories.find((c) => c._id === selectedCategory)?.shortName ||
              "Sub-categories"}
          </button>

          {/* Sub-category Items */}
          {subCategories.map((subCategory) => (
            <button
              key={subCategory._id}
              onClick={() => handleSubCategoryClick(subCategory._id)}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 border-2",
                selectedSubCategory === subCategory._id
                  ? "bg-[#1a4da1] text-white border-[#1a4da1] shadow-md"
                  : "text-gray-700 border-gray-300 bg-white hover:border-[#1a4da1] hover:bg-blue-50",
              )}
            >
              {showIcons && subCategory.icon && (
                <span className="text-sm">{subCategory.icon}</span>
              )}
              <span>{subCategory.shortName || subCategory.name}</span>
              {subCategory.courseCount !== undefined &&
                subCategory.courseCount > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] font-bold rounded-full",
                      selectedSubCategory === subCategory._id
                        ? "bg-[#133a7a] text-white"
                        : "bg-gray-200 text-gray-700",
                    )}
                  >
                    {subCategory.courseCount}
                  </span>
                )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

/**
 * CategoryChips Component
 * A simpler horizontal scrollable list of categories as chips/badges.
 * Good for mobile or compact layouts.
 */
interface CategoryChipsProps {
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  showCounts?: boolean;
  className?: string;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onCategoryChange,
  showCounts = true,
  className,
}) => {
  const { data, isLoading } = useGetMainCategoriesQuery();
  const categories = data?.data || [];

  if (isLoading) {
    return (
      <div className={cn("flex gap-2 overflow-x-auto pb-2", className)}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-24 bg-gray-200 rounded-full animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-2 scrollbar-hide",
        className,
      )}
    >
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          "shrink-0 px-4 py-1.5 text-sm font-medium rounded-full transition-all",
          !selectedCategory
            ? "bg-purple-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200",
        )}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category._id}
          onClick={() => onCategoryChange(category._id)}
          className={cn(
            "shrink-0 px-4 py-1.5 text-sm font-medium rounded-full transition-all flex items-center gap-1.5",
            selectedCategory === category._id
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200",
          )}
        >
          {category.icon && <span>{category.icon}</span>}
          <span>{category.shortName || category.name}</span>
          {showCounts &&
            category.courseCount !== undefined &&
            category.courseCount > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-xs rounded-full",
                  selectedCategory === category._id
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-600",
                )}
              >
                {category.courseCount}
              </span>
            )}
        </button>
      ))}
    </div>
  );
};

/**
 * CategoryDropdown Component
 * A dropdown/select style category filter.
 * Good for forms or when space is limited.
 */
interface CategoryDropdownProps {
  selectedCategory: string | null;
  selectedSubCategory?: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onSubCategoryChange?: (subCategoryId: string | null) => void;
  showSubCategories?: boolean;
  placeholder?: string;
  className?: string;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  selectedCategory,
  selectedSubCategory,
  onCategoryChange,
  onSubCategoryChange,
  showSubCategories = false,
  placeholder = "Select Category",
  className,
}) => {
  const { data: hierarchyData, isLoading } = useGetCategoryHierarchyQuery();
  const categories = hierarchyData?.data || [];

  const selectedCategoryData = categories.find(
    (c) => c._id === selectedCategory,
  );
  const subCategories = selectedCategoryData?.subCategories || [];

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3", className)}>
      {/* Main Category Dropdown */}
      <div className="relative flex-1">
        <select
          value={selectedCategory || ""}
          onChange={(e) => {
            const value = e.target.value || null;
            onCategoryChange(value);
            if (onSubCategoryChange) onSubCategoryChange(null);
          }}
          disabled={isLoading}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer appearance-none"
        >
          <option value="">{placeholder}</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.icon ? `${category.icon} ` : ""}
              {category.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>

      {/* Sub-Category Dropdown (conditional) */}
      {showSubCategories &&
        selectedCategory &&
        subCategories.length > 0 &&
        onSubCategoryChange && (
          <div className="relative flex-1">
            <select
              value={selectedSubCategory || ""}
              onChange={(e) => onSubCategoryChange(e.target.value || null)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer appearance-none"
            >
              <option value="">
                All {selectedCategoryData?.shortName || "Sub-categories"}
              </option>
              {subCategories.map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.icon ? `${subCategory.icon} ` : ""}
                  {subCategory.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        )}
    </div>
  );
};

export default CategoryTabs;