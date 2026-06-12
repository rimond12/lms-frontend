"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTransition } from "react";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      router.push(pathname, { locale: newLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            className ? className : "text-gray-100 hover:text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-100",
            isPending && "opacity-60 cursor-wait",
          )}
        >
          <Globe size={18} />
          <span className="uppercase">{locale === "bn" ? "BN" : "EN"}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 p-2">
        <DropdownMenuItem
          onClick={() => handleLocaleChange("en")}
          className="flex items-center justify-between cursor-pointer rounded-md p-2 hover:bg-purple-50 hover:text-purple-600"
        >
          <span>English</span>
          {locale === "en" && <Check size={16} className="text-purple-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLocaleChange("bn")}
          className="flex items-center justify-between cursor-pointer rounded-md p-2 hover:bg-purple-50 hover:text-purple-600"
        >
          <span>বাংলা</span>
          {locale === "bn" && <Check size={16} className="text-purple-600" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
