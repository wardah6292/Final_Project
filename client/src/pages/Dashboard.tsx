import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Briefcase, FileText, Search, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { useApplications } from "@/hooks/use-applications";
import { useDocuments } from "@/hooks/use-documents";

export default function Dashboard() {
  const { data: applications } = useApplications();
  const { data: documents } = useDocuments();

  const activeApps = applications?.filter(a => a.status !== "Rejected").length || 0;
  const interviewCount = applications?.filter(a => a.status === "Interview").length || 0;
  
  const cards = [
    {
      title: "Active Applications",
      value: activeApps,
      subtitle: `${interviewCount} interviews scheduled`,
      icon: Briefcase,
      color: "bg-blue-50 text-blue-600",
      link: "/tracker"
    },
    {
      title: "Documents",
      value: documents?.length || 0,
      subtitle: "CVs and Cover Letters",
      icon: FileText,
      color: "bg-purple-50 text-purple-600",
      link: "/documents"
    },
    {
      title: "Job Fit Analysis",
      value: "Ready",
      subtitle: "Start a new analysis",
      icon: Search,
      color: "bg-green-50 text-green-600",
      link: "/analysis"
    }
  ];

  return (
    <Layout>
      <PageHeader 
        title="Welcome back! 👋✨" 
        description="Here's what's happening with your job search today."
      />

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {cards.map((card, idx) => (
          <Link key={card.title} href={card.link}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div className="p-2 bg-slate-50 rounded-full text-slate-400">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{card.value}</div>
              <div className="font-semibold text-slate-700 mb-1">{card.title}</div>
              <div className="text-sm text-muted-foreground">{card.subtitle}</div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Activity / Graph placeholder */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Weekly Progress</h3>
            <TrendingUp className="text-green-500 w-5 h-5" />
          </div>
          <div className="h-48 flex items-end justify-between gap-2">
            {[40, 65, 30, 85, 50, 90, 60].map((h, i) => (
              <div key={i} className="w-full bg-slate-50 rounded-t-xl relative group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                  className="absolute bottom-0 w-full bg-primary/20 group-hover:bg-primary/40 transition-colors rounded-t-xl"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-lg relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors" />
           
           <h3 className="text-2xl font-bold mb-4 relative z-10 flex items-center gap-3">
             <Sparkles className="w-6 h-6 text-indigo-300" /> Pro Tip of the Day
           </h3>
           <p className="text-indigo-50/90 text-lg leading-relaxed mb-8 relative z-10 font-medium">
             Tailoring your resume for each application increases your chances of passing ATS scans by up to 50%. Try our Job Fit Analysis tool to see where you stand!
           </p>
           
           <Link href="/analysis">
             <button className="relative z-10 px-8 py-3.5 bg-white text-indigo-900 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2 group/btn">
               Try Analysis Tool <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
             </button>
           </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
