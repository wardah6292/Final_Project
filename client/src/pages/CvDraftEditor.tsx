import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useLocation } from "wouter";
import { Sparkles, Download, Save, ArrowLeft, FileText, Check, FileUp, Plus, Undo } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDocuments, useCreateDocument } from "@/hooks/use-documents";
import { Textarea } from "@/components/ui/textarea";

export default function CvDraftEditor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: documents } = useDocuments();
  const createDoc = useCreateDocument();
  
  const searchParams = new URLSearchParams(window.location.search);
  const missingSkills = JSON.parse(searchParams.get('missingSkills') || '[]');

  const [cvContent, setCvContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasAppliedKeywords, setHasAppliedKeywords] = useState(false);
  const [originalContent, setOriginalContent] = useState("");

  // Prefill from saved CVs
  useEffect(() => {
    if (documents) {
      const latestCv = documents
        .filter(d => d.type === 'cv')
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
      
      if (latestCv) {
        setCvContent(latestCv.content);
        if (latestCv.name.toLowerCase().endsWith('.pdf')) {
          setFileName(latestCv.name);
        }
      }
    }
  }, [documents]);

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

  const handleApplyKeywords = () => {
    if (!hasAppliedKeywords) {
      setOriginalContent(cvContent);
      let newContent = cvContent;
      if (!newContent.includes("### Relevant Keywords & Skills")) {
        newContent += "\n\n### Relevant Keywords & Skills\n";
      } else {
        newContent += "\n";
      }
      
      missingSkills.forEach((skill: string) => {
        if (!newContent.includes(skill)) {
          newContent += `- ${skill}\n`;
        }
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

  const exportAsTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([cvContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `CV_Draft_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    toast({ title: "Exported!", description: "Your CV has been downloaded as a text file." });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <button onClick={() => setLocation('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={handleSaveDraft} 
            disabled={isSaving || !cvContent}
            className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button 
            onClick={exportAsTxt} 
            className="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export (.txt)
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <FileText className="w-4 h-4 text-slate-400" /> Reference
            </h4>
            {fileName ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <FileUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-slate-600 truncate">{fileName}</span>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No original file uploaded</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-primary" /> Suggested Keywords
            </h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {missingSkills.length > 0 ? (
                missingSkills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400">No specific keywords suggested yet.</p>
              )}
            </div>
            <button
              onClick={hasAppliedKeywords ? handleUndoKeywords : handleApplyKeywords}
              disabled={missingSkills.length === 0}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                hasAppliedKeywords 
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                  : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
              }`}
            >
              {hasAppliedKeywords ? (
                <><Undo className="w-4 h-4" /> Undo Insertion</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Insert Keywords</>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl min-h-[700px] flex flex-col">
            <h4 className="font-bold text-slate-800 mb-4">CV Draft Editor</h4>
            <Textarea
              value={cvContent}
              onChange={(e) => setCvContent(e.target.value)}
              placeholder="Paste your CV text here to start editing..."
              className="flex-1 bg-slate-50 border-none rounded-2xl p-8 font-serif text-lg leading-relaxed resize-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
