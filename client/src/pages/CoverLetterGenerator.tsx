import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useDocuments } from "@/hooks/use-documents";
import { useGenerateCoverLetter } from "@/hooks/use-analysis";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function CoverLetterGenerator() {
  const { data: documents } = useDocuments();
  const generateMutation = useGenerateCoverLetter();
  
  const [jobDescription, setJobDescription] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const jd = searchParams.get('jobDescription');
    const cv = searchParams.get('cvContent');
    if (jd) setJobDescription(jd);
    // Find doc ID by content if passed, or just use the first available CV
    const cvs = documents?.filter(d => d.type === 'cv') || [];
    if (cvs.length > 0 && !selectedDocId) {
      setSelectedDocId(cvs[0].id.toString());
    }
  }, [documents]);

  const cvs = documents?.filter(d => d.type === 'cv') || [];

  const handleGenerate = () => {
    if (!jobDescription || !selectedDocId) return;
    const doc = documents?.find(d => d.id.toString() === selectedDocId);
    if (!doc) return;

    generateMutation.mutate({
      jobDescription,
      cvContent: doc.content,
      company,
      role
    }, {
      onSuccess: (data) => setGeneratedContent(data.content)
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <PageHeader 
        title="Cover Letter Writer" 
        description="Draft a tailored cover letter in seconds using AI."
      />

      <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
        {/* Form */}
        <div className="space-y-6 overflow-y-auto pr-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Company</Label>
                 <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google" className="rounded-xl border-slate-200" />
               </div>
               <div className="space-y-2">
                 <Label>Role</Label>
                 <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Product Designer" className="rounded-xl border-slate-200" />
               </div>
             </div>
             
             <div className="space-y-2">
               <Label>Select CV</Label>
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

             <div className="space-y-2">
               <Label>Job Description</Label>
               <Textarea 
                 value={jobDescription} 
                 onChange={e => setJobDescription(e.target.value)} 
                 placeholder="Paste full JD here..." 
                 className="min-h-[200px] rounded-xl border-slate-200"
               />
             </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !jobDescription || !selectedDocId}
            className="w-full h-14 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-200 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none"
          >
            {generateMutation.isPending ? (
              <span className="flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5 animate-spin" /> Writing Magic...
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5" /> Generate Letter
              </span>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="relative h-full">
           {generatedContent ? (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="h-full bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col"
             >
               <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-slate-700">Generated Draft</h3>
                 <button 
                   onClick={copyToClipboard}
                   className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                 >
                   {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                   {copied ? "Copied" : "Copy Text"}
                 </button>
               </div>
               <textarea 
                 className="flex-1 p-6 resize-none focus:outline-none text-slate-700 leading-relaxed font-serif text-lg"
                 value={generatedContent}
                 onChange={e => setGeneratedContent(e.target.value)}
               />
             </motion.div>
           ) : (
             <div className="h-full bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                 <Sparkles className="w-10 h-10 text-purple-200" />
               </div>
               <h3 className="text-xl font-bold text-slate-400 mb-2">Magic Awaits</h3>
               <p className="text-slate-400 max-w-xs">Fill in the details and watch AI write your first draft.</p>
             </div>
           )}
        </div>
      </div>
    </Layout>
  );
}
