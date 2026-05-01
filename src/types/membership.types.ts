/**
 * Membership Application Types
 * Centralized type definitions for membership application system
 */

export enum MEMBERSHIP_TYPE {
  SENIOR_FELLOW = 'SeniorFellow',
  MEMBER = 'Member',
  ASSOCIATE = 'Associate'
}

export enum APPLICATION_STATUS {
  PENDING = 'PENDING',
  AWAITING_REFERENCES = 'AWAITING_REFERENCES',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED'
}

export enum REFERENCE_STATUS {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum REFERENCE_MODE {
  SEARCH = 'search',
  MANUAL = 'manual'
}

/**
 * Member interface for search results
 */
export interface IMember {
  _id: string;
  // // membershipId: // REMOVED string; // REMOVED
  name: string;
  email: string;
  phone?: string;
}

/**
 * Manual Reference Entry
 * Used when user adds reference manually (no email sent)
 */
export interface IManualReference {
  iebMemberId?: string; // IEB Member ID (Optional)
  name: string;
  designation: string;
  email: string;
  phone: string;
  relation: string; // Must be personally known (e.g., Colleague, Friend)
  workingPlace: string; // Organization name
}

/**
 * Reference Member Info
 * Stored with application for quick access
 */
export interface IReferenceMemberInfo {
  // // membershipId: // REMOVED string; // REMOVED
  name: string;
  email: string;
}

/**
 * Complete Reference Object
 * Supports both search-based and manual entry modes
 */
export interface IReference {
  _id?: string;
  // Search mode - reference to existing BASE member
  referenceMemberId?: {
    _id: string;
    // // membershipId: // REMOVED string; // REMOVED
    name: string;
    email: string;
  };
  referenceMemberInfo?: IReferenceMemberInfo;
  
  // Manual mode - reference entered manually
  manualReference?: IManualReference;
  isManualEntry?: boolean;
  
  // Common fields
  status: keyof typeof REFERENCE_STATUS;
  requestedAt: string;
  respondedAt?: string;
  comments?: string;
}

/**
 * Validation helper types
 */
export interface IReferenceValidation {
  isValid: boolean;
  hasSearchReference: boolean;
  hasManualReference: boolean;
  mode: REFERENCE_MODE | null;
}

/**
 * Type guard to check if reference is valid
 */
export function isValidReference(ref: any): ref is IReference {
  if (!ref) return false;
  
  // Check if this is an empty placeholder object
  const hasAnyMeaningfulData = Boolean(
    ref._id || 
    ref.referenceMemberInfo || 
    ref.referenceMemberId || 
    ref.manualReference ||
    ref.isManualEntry !== undefined
  );
  
  if (!hasAnyMeaningfulData) return false;
  
  // Check for search-based reference
  const hasSearchReference = Boolean(
    ref.referenceMemberInfo?.membershipId || 
    ref.referenceMemberId?.membershipId ||
    (ref.referenceMemberId && ref.referenceMemberId._id)
  );
  
  // Check for manual reference
  const hasManualReference = Boolean(
    ref.isManualEntry === true && 
    ref.manualReference?.name
  );
  
  // Also check for legacy manual references
  const hasLegacyManualReference = Boolean(
    !ref.referenceMemberId && 
    !ref.referenceMemberInfo && 
    ref.manualReference?.name
  );
  
  return hasSearchReference || hasManualReference || hasLegacyManualReference;
}

/**
 * Get reference mode helper
 */
export function getReferenceMode(ref: IReference | null): REFERENCE_MODE | null {
  if (!ref || !isValidReference(ref)) return null;
  
  if (ref.isManualEntry || (ref.manualReference && !ref.referenceMemberId)) {
    return REFERENCE_MODE.MANUAL;
  }
  
  if (ref.referenceMemberId || ref.referenceMemberInfo) {
    return REFERENCE_MODE.SEARCH;
  }
  
  return null;
}

/**
 * Count references by mode
 */
export interface IReferenceCount {
  total: number;
  search: number;
  manual: number;
  valid: number;
}

export function countReferences(references: (IReference | null)[]): IReferenceCount {
  const validRefs = references.filter(isValidReference);
  
  const searchCount = validRefs.filter(ref => 
    getReferenceMode(ref) === REFERENCE_MODE.SEARCH
  ).length;
  
  const manualCount = validRefs.filter(ref => 
    getReferenceMode(ref) === REFERENCE_MODE.MANUAL
  ).length;
  
  return {
    total: references.length,
    valid: validRefs.length,
    search: searchCount,
    manual: manualCount
  };
}

/**
 * Validate manual reference data
 */
export function validateManualReference(manual: IManualReference | null): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!manual) {
    errors.push('Manual reference data is missing');
    return { isValid: false, errors };
  }
  
  // Required fields
  if (!manual.name?.trim()) errors.push('Name is required');
  if (!manual.designation?.trim()) errors.push('Designation is required');
  if (!manual.email?.trim()) errors.push('Email is required');
  if (!manual.phone?.trim()) errors.push('Phone is required');
  if (!manual.relation?.trim()) errors.push('Relation is required');
  if (!manual.workingPlace?.trim()) errors.push('Working place is required');
  
  // Email validation
  if (manual.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manual.email)) {
    errors.push('Invalid email format');
  }
  
  // Phone validation
  if (manual.phone && manual.phone.length < 10) {
    errors.push('Phone number must be at least 10 digits');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Reference label generator based on category
 */
export function getReferenceLabel(category: string | null, index: number): string {
  if (!category) return `Reference ${index + 1} *`;
  
  const labels: Record<string, string[]> = {
    Member: [
      "Reference Fellow (1)*",
      "Reference Member (2)*",
      "Reference Member (3)*"
    ],
    SeniorFellow: [
      "Reference Fellow (1)*",
      "Reference Fellow (2)*",
      "Reference Member/Fellow (3)*"
    ],
    Associate: [
      "Reference Member/Fellow (1)*",
      "Reference Member/Fellow (2)*",
      "Reference Any Member (3)*"
    ]
  };
  
  return labels[category]?.[index] || `Reference ${index + 1} *`;
}

