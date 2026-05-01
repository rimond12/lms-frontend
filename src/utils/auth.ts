import { IUser } from '@/lib/types';

export const isAuthenticated = (user: IUser | null): boolean => {
  return !!user && !!user._id;
};

export const hasRole = (user: IUser | null, roles: string[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const isAdmin = (user: IUser | null): boolean => {
  return hasRole(user, ['ADMIN']);
};

export const isTeacher = (user: IUser | null): boolean => {
  return hasRole(user, ['TEACHER', 'ADMIN']);
};

export const isStudent = (user: IUser | null): boolean => {
  return hasRole(user, ['STUDENT']);
};