import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useDocuments } from "@/hooks/use-documents";
import { useGenerateCoverLetter } from "@/hooks/use-analysis";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Copy, Check, Save, RefreshCw, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateDocument } from "@/hooks/use-documents";

export default function CoverLetterGenerator() {
  const { data: documents } = useDocuments();
  const generateMutation = useGenerateCoverLetter();
  const createDoc = useCreateDocument();
  const { toast } = useToast();
  
  const [jobDescription, setJobDescription] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const jd = searchParams.get('jobDescription');
    const comp = searchParams.get('company') || "Acme Corp";
    const pos = searchParams.get('role') || "Job Role";
    
    if (jd) setJobDescription(jd);
    setCompany(comp);
    setRole(pos);

    const cvs = documents?.filter(d => d.type === 'cv') || [];
    if (cvs.length > 0 && !selectedDocId) {
      setSelectedDocId(cvs[0].id.toString());
    }
  }, [documents]);

  // Auto-generate on first load if we have context
  useEffect(() => {
    if (jobDescription && selectedDocId && !generatedContent && !generateMutation.isPending) {
      handleGenerate();
    }
  }, [jobDescription, selectedDocId]);

  const handleGenerate = () => {
    const doc = documents?.find(d => d.id.toString() === selectedDocId);
    if (!doc) {
      // Placeholder if no AI or doc
      setGeneratedContent(`Dear Hiring Manager at ${company || "the company"},\n\nI am excited to apply for the ${role || "position"} role. Based on my experience with ${doc?.name || "relevant projects"}, I believe I am a great fit...\n\nSincerely,\n[Your Name]`);
      return;
    }

    generateMutation.mutate({
      jobDescription,
      cvContent: doc.content,
      company: company || "Company",
      role: role || "Position"
    }, {
      onSuccess: (data) => setGeneratedContent(data.content)
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    createDoc.mutate({
      name: `Cover Letter - ${company || 'Draft'}`,
      content: generatedContent,
      type: "cover_letter",
      userId: 1
    }, {
      onSuccess: () => {
        setIsSaving(false);
        toast({ title: "Saved!", description: "Cover letter saved to your documents." });
      },
      onError: () => setIsSaving(false)
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
        title="Cover Letter Draft" 
        description="Your AI-powered draft is ready for review."
      />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Context */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <FileText className="w-4 h-4 text-slate-400" /> Job Context
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Company</span>
                <p className="font-bold text-slate-800">{company || "Acme Corp"}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Role</span>
                <p className="font-bold text-slate-800">{role || "Job Role"}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Description Summary</span>
                <p className="text-sm text-slate-600 line-clamp-4 bg-slate-50 p-3 rounded-xl mt-1">
                  {jobDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-900 text-white p-6 rounded-[2rem] shadow-lg">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> AI Guidance
            </h4>
            <p className="text-sm text-indigo-100 leading-relaxed italic">
              "We've focused on matching your experience with the key requirements mentioned in the JD. Don't forget to add a personal touch!"
            </p>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col h-[600px] relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Edit Draft</h3>
                <p className="text-xs text-slate-400 mt-1">This is a draft — you can edit it before using. ✨</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Regenerate draft"
                >
                  <RefreshCw className={`w-5 h-5 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Textarea 
              className="flex-1 p-0 border-none focus-visible:ring-0 resize-none text-slate-700 leading-relaxed font-serif text-lg bg-transparent"
              value={generatedContent}
              onChange={e => setGeneratedContent(e.target.value)}
              placeholder="Generating your draft..."
            />

            {generateMutation.isPending && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-[2rem] z-10">
                <div className="flex flex-col items-center gap-4">
                  <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                  <p className="font-bold text-slate-800">Writing your story...</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleSave}
              disabled={isSaving || !generatedContent}
              className="flex-1 h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" /> {isSaving ? "Saving..." : "Save cover letter to this application"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
