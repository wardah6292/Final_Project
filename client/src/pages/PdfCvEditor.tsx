import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Document, Page, pdfjs } from "react-pdf";
import { useLocation } from "wouter";
import { Sparkles, Download, Save, Plus, MousePointer2, Trash2, Type, ArrowLeft, Link2, Check, FileUp, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useDocuments } from "@/hooks/use-documents";

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface Annotation {
  id: string;
  text: string;
  x: number;
  y: number;
}

export default function UnifiedPdfEditor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: documents } = useDocuments();
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  
  const searchParams = new URLSearchParams(window.location.search);
  const initialPdfUrl = searchParams.get('pdfUrl');
  const missingSkills = JSON.parse(searchParams.get('missingSkills') || '["React", "TypeScript", "Node.js"]');

  const [pdfUrl, setPdfUrl] = useState<string | null>(initialPdfUrl);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isAddingText, setIsAddingText] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const savedCvs = documents?.filter(d => d.type === 'cv' && (d.name.toLowerCase().includes('.pdf') || d.content.startsWith('http'))) || [];

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadProgress(0);
      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      reader.onload = () => {
        const result = reader.result as string;
        setPdfUrl(result);
        setAnnotations([]);
        setUploadProgress(null);
        toast({ title: "PDF Uploaded", description: "You can now start editing." });
      };

      reader.onerror = () => {
        setUploadProgress(null);
        toast({ title: "Upload Failed", description: "There was an error reading the file.", variant: "destructive" });
      };

      reader.readAsDataURL(file);
    } else {
      toast({ title: "Invalid File", description: "Please upload a PDF document.", variant: "destructive" });
    }
  };

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
    const canvas = await html2canvas(pdfContainerRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('updated_cv.pdf');
    toast({ title: "Success!", description: "Your updated CV has been downloaded." });
  };

  const handleSave = () => {
    if (pdfUrl) {
      localStorage.setItem(`cv_annotations_${pdfUrl}`, JSON.stringify(annotations));
      toast({ title: "Saved!", description: "Your changes have been stored locally." });
    }
  };

  useEffect(() => {
    if (pdfUrl) {
      const saved = localStorage.getItem(`cv_annotations_${pdfUrl}`);
      if (saved) setAnnotations(JSON.parse(saved));
    }
  }, [pdfUrl]);

  if (!pdfUrl) {
    return (
      <Layout>
        <PageHeader title="PDF CV Editor" description="Upload a new PDF or select from your saved documents to begin." />
        <div className="max-w-4xl mx-auto py-12 space-y-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center text-center group cursor-pointer relative">
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadProgress !== null} />
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {uploadProgress !== null ? (
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-primary/20" />
                      <circle 
                        cx="24" cy="24" r="20" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={125.6}
                        strokeDashoffset={125.6 - (125.6 * uploadProgress / 100)}
                        className="text-primary transition-all duration-300" 
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold">{uploadProgress}%</span>
                  </div>
                ) : (
                  <FileUp className="w-10 h-10" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {uploadProgress !== null ? `Uploading... ${uploadProgress}%` : "Upload PDF"}
              </h3>
              <p className="text-slate-500">
                {uploadProgress !== null ? "Almost there!" : "Drop your CV here or click to browse"}
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Saved Documents</h3>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {savedCvs.length > 0 ? (
                  savedCvs.map(cv => (
                    <button
                      key={cv.id}
                      onClick={() => setPdfUrl(cv.content)}
                      className="w-full p-4 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-all text-left flex items-center gap-4 group"
                    >
                      <div className="p-2 bg-slate-50 text-slate-400 group-hover:text-primary rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-700 truncate">{cv.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 italic">No saved PDF CVs found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <button onClick={() => setPdfUrl(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to selection
        </button>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={handleSave} className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save
          </button>
          <button onClick={exportPdf} className="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Type className="w-4 h-4" /> Tools
            </h4>
            <button 
              onClick={() => setIsAddingText(!isAddingText)}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isAddingText ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-4 h-4" /> {isAddingText ? 'Click on PDF' : 'Add Text Box'}
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
                    const newAnno = { id: Math.random().toString(36).substr(2, 9), text: skill, x: 100, y: 100 };
                    setAnnotations([...annotations, newAnno]);
                    setSelectedId(newAnno.id);
                  }}
                  className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div 
            ref={pdfContainerRef}
            onClick={handleAddAnnotation}
            className={`relative bg-slate-100 rounded-[2rem] p-8 min-h-[800px] overflow-auto flex flex-col items-center border-2 border-dashed border-slate-200 transition-all ${
              isAddingText ? 'cursor-crosshair border-primary/40 bg-primary/5 shadow-inner' : 'cursor-default'
            }`}
          >
            <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)} className="shadow-2xl">
              {Array.from(new Array(numPages || 0), (el, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} width={700} renderAnnotationLayer={false} renderTextLayer={false} className="mb-4" />
              ))}
            </Document>

            {annotations.map(anno => (
              <div 
                key={anno.id}
                style={{ left: anno.x, top: anno.y }}
                className={`absolute z-10 p-2 rounded-lg group transition-all ${
                  selectedId === anno.id ? 'ring-2 ring-primary bg-white shadow-xl' : 'hover:bg-white/50'
                }`}
                onClick={(e) => { e.stopPropagation(); setSelectedId(anno.id); }}
              >
                <div className="flex items-center gap-2">
                  <input 
                    className="bg-transparent border-none outline-none font-bold text-slate-800 text-sm min-w-[50px] focus:ring-0"
                    value={anno.text}
                    autoFocus={selectedId === anno.id}
                    onChange={(e) => setAnnotations(annotations.map(a => a.id === anno.id ? { ...a, text: e.target.value } : a))}
                  />
                  <button onClick={() => setAnnotations(annotations.filter(a => a.id !== anno.id))} className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-red-50 rounded transition-all">
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
