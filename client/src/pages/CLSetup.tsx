import { useState } from "react";
import { useLocation } from "wouter";
import { FileText, Upload, Type, ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateDocument } from "@/hooks/use-documents";

export default function CLSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createDoc = useCreateDocument();
  const [method, setMethod] = useState<"upload" | "paste" | null>(null);
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");

  const handleContinue = (isSkip = false) => {
    if (!isSkip) {
      if (method === "paste" && !content) {
        toast({ title: "Content required", description: "Please paste your cover letter text.", variant: "destructive" });
        return;
      }
      if (method === "upload" && !fileName) {
        toast({ title: "File required", description: "Please upload your cover letter file.", variant: "destructive" });
        return;
      }

      createDoc.mutate({
        name: fileName || "Pasted Cover Letter",
        content: content || `Simulated upload: ${fileName}`,
        type: "cover_letter",
        userId: 1
      }, {
        onSuccess: () => {
          setLocation("/dashboard");
        }
      });
    } else {
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 text-primary rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Cover Letter Setup</h2>
        </div>

        <p className="text-slate-600 mb-8">
          Optional: Add a base cover letter to help the AI understand your style.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setMethod("upload")}
            className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
              method === "upload" ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
            }`}
          >
            <Upload className="w-8 h-8 text-slate-400" />
            <span className="font-bold">Upload CL</span>
          </button>
          <button
            onClick={() => setMethod("paste")}
            className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
              method === "paste" ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
            }`}
          >
            <Type className="w-8 h-8 text-slate-400" />
            <span className="font-bold">Paste Text</span>
          </button>
        </div>

        {method === "upload" && (
          <div className="mb-8 p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center gap-4">
            <input
              type="file"
              id="cl-upload"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
            />
            <label htmlFor="cl-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <span className="text-sm font-medium text-slate-500">
                {fileName || "Click to select PDF or DOCX"}
              </span>
            </label>
          </div>
        )}

        {method === "paste" && (
          <div className="mb-8">
            <Textarea
              placeholder="Paste your cover letter text here..."
              className="min-h-[200px] rounded-xl border-slate-200"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleContinue(false)}
            disabled={!method}
            className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleContinue(true)}
            className="w-full h-14 bg-white text-slate-600 rounded-2xl font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
