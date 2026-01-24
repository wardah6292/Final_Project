import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Document, Page, pdfjs } from "react-pdf";
import { useLocation } from "wouter";
import { Sparkles, Download, Save, Plus, MousePointer2, Trash2, Type, ArrowLeft, Link2, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface Annotation {
  id: string;
  text: string;
  x: number;
  y: number;
}

export default function PdfCvEditor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  
  const searchParams = new URLSearchParams(window.location.search);
  const pdfUrl = searchParams.get('pdfUrl') || '/sample-cv.pdf'; // Fallback for prototype
  const missingSkills = JSON.parse(searchParams.get('missingSkills') || '["React", "TypeScript", "Node.js"]');

  const [numPages, setNumPages] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isAddingText, setIsAddingText] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [docId, setDocId] = useState<number | null>(null);

  const handleAddAnnotation = (e: React.MouseEvent) => {
    if (!isAddingText || !pdfContainerRef.current) return;
    
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newAnno: Annotation = {
      id: Math.random().toString(36).substr(2, 9),
      text: "New Text",
      x,
      y
    };
    
    setAnnotations([...annotations, newAnno]);
    setIsAddingText(false);
    setSelectedId(newAnno.id);
  };

  const exportPdf = async () => {
    if (!pdfContainerRef.current) return;
    toast({ title: "Generating PDF...", description: "Please wait a moment." });
    
    const canvas = await html2canvas(pdfContainerRef.current, {
      scale: 2,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('updated_cv.pdf');
    toast({ title: "Success!", description: "Your updated CV has been downloaded." });
  };

  const handleSave = () => {
    localStorage.setItem(`cv_annotations_${pdfUrl}`, JSON.stringify(annotations));
    if (!docId) setDocId(Date.now());
    toast({ title: "Saved!", description: "Your changes have been stored locally." });
  };

  const copyShareLink = () => {
    const id = docId || Date.now();
    const shareUrl = `${window.location.origin}/share/${id}?isPdf=true&pdfUrl=${encodeURIComponent(pdfUrl)}&annos=${encodeURIComponent(JSON.stringify(annotations))}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "Link Copied!", description: "Anyone with this link can view your annotated PDF." });
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const saved = localStorage.getItem(`cv_annotations_${pdfUrl}`);
    if (saved) setAnnotations(JSON.parse(saved));
  }, [pdfUrl]);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={copyShareLink}
            className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
            {copied ? "Copied!" : "Share Link"}
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button 
            onClick={exportPdf}
            className="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Updated PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Toolbar & Keywords */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Type className="w-4 h-4" /> Tools
            </h4>
            <button 
              onClick={() => setIsAddingText(!isAddingText)}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isAddingText ? 'bg-primary text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-4 h-4" /> Add Text Box
            </button>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-primary" /> Suggested Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill: string) => (
                <button
                  key={skill}
                  onClick={() => {
                    if (selectedId) {
                      setAnnotations(annotations.map(a => 
                        a.id === selectedId ? { ...a, text: a.text + " " + skill } : a
                      ));
                    } else {
                      const newAnno = {
                        id: Math.random().toString(36).substr(2, 9),
                        text: skill,
                        x: 100,
                        y: 100
                      };
                      setAnnotations([...annotations, newAnno]);
                      setSelectedId(newAnno.id);
                    }
                  }}
                  className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-4 leading-tight italic">
              Click a keyword to insert it into the selected box or create a new one.
            </p>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="lg:col-span-3">
          <div 
            ref={pdfContainerRef}
            onClick={handleAddAnnotation}
            className={`relative bg-slate-100 rounded-[2rem] p-8 min-h-[800px] overflow-auto flex flex-col items-center border-2 border-dashed border-slate-200 transition-colors ${
              isAddingText ? 'cursor-crosshair border-primary/40 bg-primary/5' : 'cursor-default'
            }`}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              className="shadow-2xl"
            >
              {Array.from(new Array(numPages || 0), (el, index) => (
                <Page 
                  key={`page_${index + 1}`} 
                  pageNumber={index + 1} 
                  width={700}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  className="mb-4"
                />
              ))}
            </Document>

            {annotations.map(anno => (
              <div 
                key={anno.id}
                style={{ left: anno.x, top: anno.y }}
                className={`absolute z-10 p-2 rounded-lg group transition-all ${
                  selectedId === anno.id ? 'ring-2 ring-primary bg-white shadow-xl' : 'hover:bg-white/50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(anno.id);
                }}
              >
                <div className="flex items-center gap-2">
                  <input 
                    className="bg-transparent border-none outline-none font-bold text-slate-800 text-sm min-w-[50px] focus:ring-0"
                    value={anno.text}
                    autoFocus={selectedId === anno.id}
                    onChange={(e) => {
                      setAnnotations(annotations.map(a => a.id === anno.id ? { ...a, text: e.target.value } : a));
                    }}
                  />
                  <button 
                    onClick={() => setAnnotations(annotations.filter(a => a.id !== anno.id))}
                    className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-red-50 rounded transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
