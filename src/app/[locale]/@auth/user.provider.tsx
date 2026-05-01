"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

import { getCurrentUser } from "./AuthService";
import { IUser } from "@/lib/types";

const UserContext = createContext<IUserProviderValues | undefined>(undefined);

interface IUserProviderValues {
  name: any;
  user: IUser | null;
  isLoading: boolean;
  setUser: (user: IUser | null) => void;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  refetch: () => Promise<void>;
}

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleUser = async () => {
    try {
      const user = await getCurrentUser();

      setUser(user ?? null);
      setIsLoading(false);
    } catch (error) {
      console.error("UserProvider: Error fetching user:", error);
      setUser(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleUser();
  }, []); // Remove isLoading dependency to prevent infinite loop

  return (
    <UserContext.Provider
      value={{
        name: user?.name ?? null,
        user,
        setUser,
        isLoading,
        setIsLoading,
        refetch: handleUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within the UserProvider context");
  }

  return context;
};

export default UserProvider;
