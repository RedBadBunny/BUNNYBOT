import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
