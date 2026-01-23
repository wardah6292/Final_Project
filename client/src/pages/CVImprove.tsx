import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle, Save, FileText, Type, Undo } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDocuments, useCreateDocument } from "@/hooks/use-documents";
import { Textarea } from "@/components/ui/textarea";

export default function CVImprove() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { data: documents } = useDocuments();
  const createDoc = useCreateDocument();
  
  const searchParams = new URLSearchParams(window.location.search);
  const jobDescription = searchParams.get('jobDescription') || '';
  const missingSkills = JSON.parse(searchParams.get('missingSkills') || '[]');
  const initialCvContent = searchParams.get('cvContent') || '';

  const [cvSource, setCvSource] = useState<"saved" | "paste" | null>(null);
  const [cvContent, setCvContent] = useState(initialCvContent);
  const [isSaving, setIsSaving] = useState(false);
  const [hasAppliedKeywords, setHasAppliedKeywords] = useState(false);
  const [originalContent, setOriginalContent] = useState("");

  const cvs = documents?.filter(d => d.type === 'cv') || [];

  const handleApplyKeywords = () => {
    if (!hasAppliedKeywords) {
      setOriginalContent(cvContent);
      let newContent = cvContent;
      newContent += "\n\n### Relevant Keywords & Skills\n";
      missingSkills.forEach((skill: string) => {
        newContent += `- ${skill}\n`;
      });
      setCvContent(newContent);
      setHasAppliedKeywords(true);
      toast({ title: "Keywords added!", description: "Added suggested phrases to your CV." });
    }
  };

  const handleUndoKeywords = () => {
    if (hasAppliedKeywords) {
      setCvContent(originalContent);
      setHasAppliedKeywords(false);
      toast({ title: "Reverted", description: "Keyword additions removed." });
    }
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    createDoc.mutate({
      name: `CV Draft - ${new Date().toLocaleDateString()}`,
      content: cvContent,
      type: "cv",
      userId: 1
    }, {
      onSuccess: () => {
        setIsSaving(false);
        toast({ title: "Draft Saved! ✨", description: "Your edited CV has been saved to Documents." });
      },
      onError: () => setIsSaving(false)
    });
  };

  return (
    <Layout>
      <PageHeader 
        title="CV Improvements" 
        description="Refine your CV to perfectly match the job description."
      />

      {!cvSource ? (
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-2xl font-bold text-slate-800 mb-8">Where should we start?</h3>
          <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
            <button
              onClick={() => {
                if (cvs.length > 0) {
                  setCvContent(cvs[0].content);
                  setCvSource("saved");
                } else {
                  toast({ title: "No saved CV", description: "Please paste your CV text instead.", variant: "destructive" });
                }
              }}
              className="p-8 rounded-[2rem] border-2 border-slate-100 bg-white hover:border-primary/20 hover:shadow-xl transition-all flex flex-col items-center gap-4 group"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <FileText className="w-8 h-8" />
              </div>
              <span className="font-bold text-lg">Use Saved CV</span>
            </button>
            <button
              onClick={() => setCvSource("paste")}
              className="p-8 rounded-[2rem] border-2 border-slate-100 bg-white hover:border-primary/20 hover:shadow-xl transition-all flex flex-col items-center gap-4 group"
            >
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Type className="w-8 h-8" />
              </div>
              <span className="font-bold text-lg">Paste CV Text</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Context */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" /> Job Description
              </h4>
              <div className="bg-slate-50 p-4 rounded-2xl text-sm text-slate-600 max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                {jobDescription || "No job description provided."}
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Suggested Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {missingSkills.length > 0 ? (
                  missingSkills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
                      {skill}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-xs font-medium">Project Management</span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-xs font-medium">Leadership</span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-xs font-medium">React.js</span>
                  </>
                )}
              </div>
              <button
                onClick={hasAppliedKeywords ? handleUndoKeywords : handleApplyKeywords}
                className={`w-full mt-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  hasAppliedKeywords 
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                    : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                }`}
              >
                {hasAppliedKeywords ? (
                  <><Undo className="w-4 h-4" /> Revert Changes</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Apply suggestions</>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col h-[600px]">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-800">CV Editor</h4>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDraft}
                    disabled={isSaving || !cvContent}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save CV draft"}
                  </button>
                </div>
              </div>
              <Textarea
                value={cvContent}
                onChange={(e) => setCvContent(e.target.value)}
                placeholder="Paste or type your CV here..."
                className="flex-1 bg-slate-50 border-none rounded-2xl p-6 font-mono text-sm leading-relaxed resize-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              onClick={() => window.location.href = '/tracker'}
              className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              Finish and View Tracker <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
