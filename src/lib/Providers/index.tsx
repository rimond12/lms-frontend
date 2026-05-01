"use client";

import * as React from "react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StoreProvider from "@/app/redux/store/StoreProvider";
import UserProvider from "@/app/[locale]/@auth/user.provider";
import { Toaster as SoonarToaster } from "sonner";
import { ThemeProvider } from "../ThemeProvider/ThemeProvider";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import LoadingSpinner from "@/components/common/LoadingSpinner/LoadingSpinner";

export interface ProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

// ✅ AppLoader — isLoading true হলে পুরো screen এ loader দেখাবে
function AppLoader({ children }: { children: React.ReactNode }) {
  const { isLoading } = useUser();

  if (isLoading) {
    return (
     <LoadingSpinner />
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <ThemeProvider>
            {/* ✅ AppLoader UserProvider এর ভেতরে — isLoading access করতে পারবে */}
            <AppLoader>{children}</AppLoader>
          </ThemeProvider>
        </StoreProvider>
        <Toaster />
        <SoonarToaster />
      </QueryClientProvider>
    </UserProvider>
  );
}
