"use client";

import React, { useState, useMemo } from "react";
import { 
  useGetCategoryHierarchyQuery,
  useGetAllCategoriesAdminQuery 
} from "@/app/redux/api/CategoryApi/CategoryApi";
import { ICategory } from "@/types/category";
import { 
  Folder, 
  FolderOpen, 
  Check, 
  ChevronDown,
  ChevronRight,
  X,
  Loader2,
  Search,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppImage from "@/components/ui/AppImage";

interface CategorySelectorProps {
  /** Selected category IDs */
  selectedCategories: string[];
  /** Primary category ID (shown with star) */
  primaryCategory?: string;
  /** Callback when categories change */
  onCategoriesChange: (categories: string[]) => void;
  /** Callback when primary category changes */
  onPrimaryCategoryChange?: (categoryId: string | undefined) => void;
  /** Maximum number of categories that can be selected */
  maxSelections?: number;
  /** Show primary category selector */
  showPrimarySelector?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Label text */
  label?: string;
  /** Required field indicator */
  required?: boolean;
  /** Additional class name */
  className?: string;
  /** Use admin API to fetch ALL categories (including inactive) */
  useAdminAPI?: boolean;
}

/**
 * CategorySelector Component
 * A multi-select dropdown for choosing course categories with hierarchy support.
 * Allows selecting multiple categories and optionally marking one as primary.
 */
const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  primaryCategory,
  onCategoriesChange,
  onPrimaryCategoryChange,
  maxSelections = 5,
  showPrimarySelector = true,
  placeholder = "Select categories...",
  error,
  label = "Categories",
  required = false,
  className,
  useAdminAPI = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch categories - use admin API if needed (for admin pages) or public API
  const { data: publicData, isLoading: publicLoading } = useGetCategoryHierarchyQuery(undefined, {
    skip: useAdminAPI, // Skip if using admin API
  });
  const { data: adminData, isLoading: adminLoading } = useGetAllCategoriesAdminQuery(undefined, {
    skip: !useAdminAPI, // Skip if not using admin API
  });

  // Use appropriate data source
  const hierarchyData = useAdminAPI ? adminData : publicData;
  const isLoading = useAdminAPI ? adminLoading : publicLoading;
  const categories = hierarchyData?.data || [];

  // Expand all by default when data loads
  React.useEffect(() => {
    if (categories.length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set(categories.map(c => c._id)));
    }
  }, [categories]);

  // Create a flat list of all categories for lookup
  const allCategoriesMap = useMemo(() => {
    const map = new Map<string, ICategory>();
    categories.forEach(cat => {
      map.set(cat._id, cat);
      cat.subCategories?.forEach(sub => map.set(sub._id, sub));
    });
    return map;
  }, [categories]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    
    const search = searchTerm.toLowerCase();
    return categories.filter(cat => {
      const matchesMain = cat.name.toLowerCase().includes(search) ||
        (cat.shortName && cat.shortName.toLowerCase().includes(search));
      const hasMatchingSub = cat.subCategories?.some(sub =>
        sub.name.toLowerCase().includes(search) ||
        (sub.shortName && sub.shortName.toLowerCase().includes(search))
      );
      return matchesMain || hasMatchingSub;
    });
  }, [categories, searchTerm]);

  // Get selected category details
  const selectedCategoryDetails = useMemo(() => {
    return selectedCategories
      .map(id => allCategoriesMap.get(id))
      .filter(Boolean) as ICategory[];
  }, [selectedCategories, allCategoriesMap]);

  // Toggle category expansion
  const toggleExpand = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    let newSelected: string[];
    
    if (selectedCategories.includes(categoryId)) {
      // Remove from selection
      newSelected = selectedCategories.filter(id => id !== categoryId);
      // If this was the primary, clear primary
      if (primaryCategory === categoryId && onPrimaryCategoryChange) {
        onPrimaryCategoryChange(newSelected[0] || undefined);
      }
    } else {
      // Add to selection (if under max)
      if (selectedCategories.length >= maxSelections) return;
      newSelected = [...selectedCategories, categoryId];
      // If this is the first selection and no primary, set as primary
      if (newSelected.length === 1 && !primaryCategory && onPrimaryCategoryChange) {
        onPrimaryCategoryChange(categoryId);
      }
    }
    
    onCategoriesChange(newSelected);
  };

  // Set as primary category
  const setPrimary = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedCategories.includes(categoryId)) return;
    if (onPrimaryCategoryChange) {
      onPrimaryCategoryChange(categoryId);
    }
  };

  // Remove a selected category
  const removeCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = selectedCategories.filter(id => id !== categoryId);
    onCategoriesChange(newSelected);
    
    if (primaryCategory === categoryId && onPrimaryCategoryChange) {
      onPrimaryCategoryChange(newSelected[0] || undefined);
    }
  };

  // Render category item
  const renderCategoryItem = (category: ICategory, isSubCategory = false) => {
    const isSelected = selectedCategories.includes(category._id);
    const isPrimary = primaryCategory === category._id;
    const hasSubCategories = category.subCategories && category.subCategories.length > 0;
    const isExpanded = expandedCategories.has(category._id);
    const isDisabled = !isSelected && selectedCategories.length >= maxSelections;

    // Check if matches search
    const matchesSearch = !searchTerm.trim() || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.shortName && category.shortName.toLowerCase().includes(searchTerm.toLowerCase()));

    // For main categories, also check if any sub matches
    const hasMatchingSub = !isSubCategory && category.subCategories?.some(sub =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.shortName && sub.shortName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Hide if doesn't match and no matching subs
    if (searchTerm.trim() && !matchesSearch && !hasMatchingSub) {
      return null;
    }

    return (
      <React.Fragment key={category._id}>
        <div
          onClick={() => !isDisabled && toggleCategory(category._id)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 cursor-pointer transition-all",
            isSubCategory && "pl-8",
            isSelected ? "bg-purple-50" : "hover:bg-gray-50",
            isDisabled && "opacity-50 cursor-not-allowed",
            !category.isActive && "opacity-60"
          )}
        >
          {/* Expand button for main categories */}
          {!isSubCategory && hasSubCategories ? (
            <button
              onClick={(e) => toggleExpand(category._id, e)}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <span className={cn("w-5", !isSubCategory && "invisible")} />
          )}

          {/* Checkbox */}
          <div
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
              isSelected
                ? "bg-purple-600 border-purple-600"
                : "border-gray-300"
            )}
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>

          {/* Category Icon/Photo */}
          {category.photoUrl ? (
            <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
              <AppImage
                photoUrl={category.photoUrl}
                alt={category.name}
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </div>
          ) : category.icon ? (
            <span className="text-base">{category.icon}</span>
          ) : (
            <div 
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ backgroundColor: (category.color || '#9333ea') + '20' }}
            >
              {isSubCategory ? (
                <Folder className="w-3.5 h-3.5" style={{ color: category.color || '#9333ea' }} />
              ) : (
                <FolderOpen className="w-3.5 h-3.5" style={{ color: category.color || '#9333ea' }} />
              )}
            </div>
          )}

          {/* Category Name */}
          <span className={cn(
            "flex-1 text-sm",
            isSelected ? "font-medium text-gray-900" : "text-gray-700"
          )}>
            {category.name}
            {!category.isActive && (
              <span className="ml-2 text-xs text-gray-400">(Inactive)</span>
            )}
          </span>

          {/* Primary star button */}
          {isSelected && showPrimarySelector && (
            <button
              onClick={(e) => setPrimary(category._id, e)}
              className={cn(
                "p-1 rounded transition-colors",
                isPrimary
                  ? "text-yellow-500"
                  : "text-gray-300 hover:text-yellow-400"
              )}
              title={isPrimary ? "Primary category" : "Set as primary"}
            >
              <Star className={cn("w-4 h-4", isPrimary && "fill-current")} />
            </button>
          )}

          {/* Course count */}
          {category.courseCount !== undefined && category.courseCount > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              {category.courseCount}
            </span>
          )}
        </div>

        {/* Sub-categories */}
        {hasSubCategories && isExpanded && (
          category.subCategories
            ?.filter(sub => sub.isActive)
            .map(subCategory => renderCategoryItem(subCategory, true))
        )}
      </React.Fragment>
    );
  };

  return (
    <div className={cn("relative", className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Selection Display / Dropdown Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "min-h-[42px] px-3 py-2 border rounded-lg cursor-pointer transition-all",
          "flex flex-wrap items-center gap-2",
          isOpen ? "border-purple-500 ring-2 ring-purple-100" : "border-gray-300 hover:border-gray-400",
          error && "border-red-300"
        )}
      >
        {selectedCategoryDetails.length > 0 ? (
          selectedCategoryDetails.map(cat => (
            <span
              key={cat._id}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm",
                primaryCategory === cat._id
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              )}
            >
              {cat.icon && <span className="text-xs">{cat.icon}</span>}
              {cat.shortName || cat.name}
              {primaryCategory === cat._id && (
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
              )}
              <button
                onClick={(e) => removeCategory(cat._id, e)}
                className="ml-0.5 hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}
        
        {/* Dropdown arrow */}
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-400 ml-auto transition-transform",
          isOpen && "rotate-180"
        )} />
      </div>

      {/* Selected count and max */}
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-gray-500">
          {selectedCategories.length}/{maxSelections} categories selected
          {showPrimarySelector && primaryCategory && (
            <span className="ml-2">
              • Primary: <span className="font-medium">{allCategoriesMap.get(primaryCategory)?.shortName || allCategoriesMap.get(primaryCategory)?.name}</span>
            </span>
          )}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-80 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Category list */}
            <div className="overflow-y-auto max-h-60">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {searchTerm ? "No categories found" : "No categories available"}
                </div>
              ) : (
                filteredCategories
                  .filter(cat => cat.isActive)
                  .map(category => renderCategoryItem(category))
              )}
            </div>

            {/* Footer */}
            {selectedCategories.length > 0 && (
              <div className="p-2 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => {
                    onCategoriesChange([]);
                    if (onPrimaryCategoryChange) onPrimaryCategoryChange(undefined);
                  }}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear all selections
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CategorySelector;
