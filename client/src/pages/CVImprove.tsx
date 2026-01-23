import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CVImprove() {
  const [location] = useLocation();
  const { toast } = useToast();
  
  const searchParams = new URLSearchParams(window.location.search);
  const jobDescription = searchParams.get('jobDescription') || '';
  const missingSkills = JSON.parse(searchParams.get('missingSkills') || '[]');
  const initialCvContent = searchParams.get('cvContent') || '';

  const [improvedCv, setImprovedCv] = useState("");
  const [isImproving, setIsImproving] = useState(false);

  useEffect(() => {
    if (initialCvContent && missingSkills.length > 0 && !improvedCv && !isImproving) {
      handleImprove();
    }
  }, [initialCvContent, missingSkills]);

  const handleImprove = async () => {
    setIsImproving(true);
    // Simulate AI Improvement for now
    setTimeout(() => {
      let content = initialCvContent;
      content += "\n\n[AI SUGGESTED ADDITIONS FOR JOB MATCHING]\n";
      missingSkills.forEach((skill: string) => {
        content += `- Demonstrated expertise in ${skill} through project implementation.\n`;
      });
      setImprovedCv(content);
      setIsImproving(false);
      toast({
        title: "CV Improved! ✨",
        description: "Added missing keywords based on the job description."
      });
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(improvedCv);
    toast({ title: "Copied!", description: "Improved CV text copied to clipboard." });
  };

  return (
    <Layout>
      <PageHeader 
        title="Improve CV" 
        description="Adding targeted keywords to help you pass ATS filters."
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" /> Target Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill: string) => (
                <span key={skill} className="px-3 py-1 bg-indigo-50 text-primary rounded-lg text-sm font-semibold">
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-4">
              We're integrating these keywords naturally into your CV structure.
            </p>
          </div>

          <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Why this works
            </h3>
            <p className="text-indigo-100 leading-relaxed">
              Recruiters use Applicant Tracking Systems (ATS) to filter for specific skills. 
              By adding these keywords, you're 3x more likely to get an interview.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Improved CV Preview</h3>
              {improvedCv && (
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  <Copy className="w-4 h-4" /> Copy Text
                </button>
              )}
            </div>

            {isImproving ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <Sparkles className="w-12 h-12 text-primary animate-spin mb-4" />
                <h4 className="text-lg font-bold text-slate-800">Sprinkling Magic Keywords...</h4>
                <p className="text-slate-500">Our AI is re-writing sections to highlight your fit.</p>
              </div>
            ) : (
              <pre className="flex-1 bg-slate-50 p-6 rounded-2xl text-sm font-mono text-slate-700 whitespace-pre-wrap overflow-auto max-h-[500px]">
                {improvedCv || "Your improved CV will appear here."}
              </pre>
            )}
          </div>
          
          <button 
            onClick={() => window.location.href = '/tracker'}
            className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            Go to Application Tracker <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Layout>
  );
}
