import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useDocuments } from "@/hooks/use-documents";
import { useAnalyzeFit } from "@/hooks/use-analysis";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { CircularProgress } from "@/components/ui/progress"; // Assuming custom component or we build it

export default function JobAnalysis() {
  const { data: documents } = useDocuments();
  const analyzeMutation = useAnalyzeFit();
  
  const [jobDescription, setJobDescription] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = () => {
    if (!jobDescription || !selectedDocId) return;
    
    const doc = documents?.find(d => d.id.toString() === selectedDocId);
    if (!doc) return;

    analyzeMutation.mutate({
      jobDescription,
      cvContent: doc.content
    }, {
      onSuccess: (data) => setResult(data)
    });
  };

  const cvs = documents?.filter(d => d.type === 'cv') || [];

  return (
    <Layout>
      <PageHeader 
        title="Job Fit Analysis" 
        description="See how well your CV matches a job description."
      />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">1. Select your CV</h3>
            <Select onValueChange={setSelectedDocId}>
              <SelectTrigger className="w-full h-12 rounded-xl border-slate-200">
                <SelectValue placeholder="Choose a CV..." />
              </SelectTrigger>
              <SelectContent>
                {cvs.map(doc => (
                  <SelectItem key={doc.id} value={doc.id.toString()}>{doc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">2. Paste Job Description</h3>
            <Textarea 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="min-h-[300px] rounded-xl border-slate-200 focus:ring-primary resize-none"
            />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending || !jobDescription || !selectedDocId}
            className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none"
          >
            {analyzeMutation.isPending ? (
              <span className="flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5 animate-spin" /> Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5" /> Analyze Match
              </span>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Score Card */}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">Fit Score</h3>
                  <p className="text-slate-500">Based on keyword matching</p>
                </div>
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                    <circle 
                      cx="48" cy="48" r="40" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * (result.fitScore || 0) / 100)}
                      className="text-primary transition-all duration-1000 ease-out" 
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold text-primary">{result.fitScore}%</span>
                </div>
              </div>

              {/* Analysis Details */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                 <div>
                   <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                     <CheckCircle className="w-5 h-5 text-green-500" /> Matching Skills
                   </h4>
                   <div className="flex flex-wrap gap-2">
                     {result.matchingSkills?.map((skill: string) => (
                       <span key={skill} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium">{skill}</span>
                     ))}
                   </div>
                 </div>

                 <div className="border-t border-slate-100 pt-6">
                   <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                     <XCircle className="w-5 h-5 text-red-400" /> Missing Keywords
                   </h4>
                   <div className="flex flex-wrap gap-2">
                     {result.missingSkills?.map((skill: string) => (
                       <span key={skill} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-medium">{skill}</span>
                     ))}
                   </div>
                 </div>

                 <div className="border-t border-slate-100 pt-6">
                   <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                     <AlertTriangle className="w-5 h-5 text-amber-500" /> Recommendation
                   </h4>
                   <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                     {result.explanation || "No explanation provided."}
                   </p>
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">Ready to Analyze</h3>
              <p className="text-slate-400 max-w-xs">Select a CV and paste a job description to see your fit score.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
