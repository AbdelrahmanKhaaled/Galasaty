import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const { language, changeLanguage, isRTL } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align= "end" className="min-w-[150px]">
        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className={`cursor-pointer flex items-center justify-between ${language === "en" ? "bg-accent font-semibold" : ""}`}
        >
          <div className="flex items-center gap-2">
            <span>🇬🇧</span>
            <span>English</span>
          </div>
          {language === "en" && <span>✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("ar")}
          className={`cursor-pointer flex items-center justify-between ${language === "ar" ? "bg-accent font-semibold" : ""}`}
        >
          <div className="flex items-center gap-2">
            <span>🇸🇦</span>
            <span>العربية</span>
          </div>
          {language === "ar" && <span>✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

