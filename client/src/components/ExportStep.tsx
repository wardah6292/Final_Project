import { Download, Link2, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ExportStepProps {
  content: string;
  filename: string;
  shareId: string | number;
}

export function ExportStep({ content, filename, shareId }: ExportStepProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({ title: "Downloaded!", description: "Your file is ready." });
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "Link Copied!", description: "Anyone with this link can view your draft." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg text-center space-y-6">
      <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
        <Check className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-bold text-slate-800">Ready to Share!</h3>
      <p className="text-slate-500">Your draft is saved. Choose how you'd like to export it.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <button
          onClick={downloadTxt}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-50 text-slate-700 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-200"
        >
          <Download className="w-5 h-5" /> Download .txt
        </button>
        <button
          onClick={copyShareLink}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-50 text-slate-700 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-200"
        >
          {copied ? <Check className="w-5 h-5 text-green-500" /> : <Link2 className="w-5 h-5" />}
          {copied ? "Copied!" : "Copy Share Link"}
        </button>
      </div>

      <div className="pt-4">
        <button 
          onClick={() => window.open(`/share/${shareId}`, '_blank')}
          className="text-primary font-bold flex items-center justify-center gap-2 mx-auto hover:underline"
        >
          Preview Share Page <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
