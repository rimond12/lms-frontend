"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RedirectToNoticeDetail() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/notice");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[50vh]">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
      <p className="text-slate-500 font-medium">Redirecting to Notice Management...</p>
    </div>
  );
}
