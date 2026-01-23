import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Search, 
  Settings, 
  LogOut,
  UserCircle
} from "lucide-react";
import { clsx } from "clsx";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tracker", label: "Applications", icon: Briefcase },
    { href: "/documents", label: "Documents", icon: FileText },
    { href: "/analysis", label: "Job Fit", icon: Search },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - hidden on mobile, block on md */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border fixed h-full z-20">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/30">
              C
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Career<br/>Companion
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={clsx(
                    "nav-item cursor-pointer",
                    isActive ? "nav-item-active" : "nav-item-inactive"
                  )}
                >
                  <item.icon className={clsx("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="nav-item w-full text-left text-muted-foreground hover:bg-red-50 hover:text-red-500">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-border z-30 flex items-center justify-between px-4">
        <div className="font-bold text-lg text-primary">Career Companion</div>
        <button className="p-2 bg-slate-100 rounded-full">
          <UserCircle className="w-6 h-6 text-slate-600" />
        </button>
      </div>
      
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-30 flex justify-around p-3 pb-safe">
         {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                  <item.icon className={clsx("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-[10px] font-medium text-slate-500">{item.label}</span>
                </div>
              </Link>
            );
          })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
