import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { FileText, Upload, Type, ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateDocument } from "@/hooks/use-documents";

export default function CVSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createDoc = useCreateDocument();
  const [method, setMethod] = useState<"upload" | "paste" | null>(null);
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");

  const handleContinue = () => {
    if (method === "paste" && !content) {
      toast({ title: "Content required", description: "Please paste your CV text.", variant: "destructive" });
      return;
    }
    if (method === "upload" && !content) {
      toast({ title: "File required", description: "Please upload your CV file.", variant: "destructive" });
      return;
    }

    createDoc.mutate({
      name: fileName || "Pasted CV",
      content: content,
      type: "cv",
      userId: 1
    }, {
      onSuccess: () => {
        setLocation("/setup-cl");
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Content = event.target?.result as string;
        setContent(base64Content);
      };
      reader.readAsDataURL(file);
    } else {
      // For non-PDF files, we might still want to store name but we won't have PDF viewer support
      // For now, let's just toast
      toast({ title: "PDF Recommended", description: "Uploading a PDF will allow you to view it later in the viewer." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 text-primary rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">CV Setup</h2>
        </div>

        <p className="text-slate-600 mb-8">
          How would you like to provide your CV? 
          <span className="block text-sm text-slate-400 mt-1 italic">"You can edit this later. AI suggestions are reviewable." ✨</span>
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setMethod("upload")}
            className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
              method === "upload" ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
            }`}
          >
            <Upload className="w-8 h-8 text-slate-400" />
            <span className="font-bold">Upload CV</span>
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
              id="cv-upload"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center gap-2">
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
              placeholder="Paste your CV text here..."
              className="min-h-[200px] rounded-xl border-slate-200"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!method}
          className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          Continue <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
