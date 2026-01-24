import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useLocation } from "wouter";
import { Sparkles, ArrowRight, CheckCircle, Save, FileText, Type, Undo, Download, Trash2, Plus, FileUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDocuments, useCreateDocument } from "@/hooks/use-documents";
import { Textarea } from "@/components/ui/textarea";
import { ExportStep } from "@/components/ExportStep";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface Annotation {
  id: number;
  text: string;
  x: number;
  y: number;
}

export default function CVImprove() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { data: documents } = useDocuments();
  const createDoc = useCreateDocument();
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  
  const searchParams = new URLSearchParams(window.location.search);
  const jobDescription = searchParams.get('jobDescription') || '';
  const missingSkills = JSON.parse(searchParams.get('missingSkills') || '[]');
  const initialCvContent = searchParams.get('cvContent') || '';
  const initialPdfUrl = searchParams.get('pdfUrl') || '';

  const [cvSource, setCvSource] = useState<"saved" | "paste" | "pdf" | null>(initialPdfUrl ? "pdf" : null);
  const [cvContent, setCvContent] = useState(initialCvContent);
  const [isSaving, setIsSaving] = useState(false);
  const [hasAppliedKeywords, setHasAppliedKeywords] = useState(false);
  const [originalContent, setOriginalContent] = useState("");
  const [savedDocId, setSavedDocId] = useState<number | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

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
      onSuccess: (data) => {
        setIsSaving(false);
        setSavedDocId(data.id);
        toast({ title: "Draft Saved! ✨", description: "Your edited CV has been saved to Documents." });
      },
      onError: () => setIsSaving(false)
    });
  };

  const addAnnotation = (e: React.MouseEvent) => {
    if (cvSource !== 'pdf' || !pdfContainerRef.current) return;
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newNote: Annotation = {
      id: Date.now(),
      text: "New note",
      x,
      y
    };
    setAnnotations([...annotations, newNote]);
  };

  const exportAnnotatedPdf = async () => {
    if (!pdfContainerRef.current) return;
    const canvas = await html2canvas(pdfContainerRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('annotated_cv.pdf');
    toast({ title: "Exported!", description: "Annotated PDF downloaded." });
  };

  return (
    <Layout>
      <PageHeader 
        title="CV Improvements" 
        description="Refine your CV to perfectly match the job description."
      />

      {savedDocId ? (
        <div className="max-w-2xl mx-auto py-12">
          <ExportStep 
            content={cvContent} 
            filename={`CV_Draft_${new Date().toLocaleDateString().replace(/\//g, '_')}`} 
            shareId={savedDocId} 
          />
        </div>
      ) : !cvSource ? (
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-2xl font-bold text-slate-800 mb-8">Where should we start?</h3>
          <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
            <button
              onClick={() => setLocation('/cv/pdf-editor')}
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
      ) : cvSource === "pdf" ? (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
           <div className="flex justify-between items-center bg-indigo-900 text-white p-6 rounded-[2rem] shadow-lg">
             <div>
               <h4 className="font-bold flex items-center gap-2">
                 <Sparkles className="w-5 h-5" /> PDF Review & Annotation
               </h4>
               <p className="text-sm text-indigo-100">Click anywhere on the PDF to add a note.</p>
             </div>
             <button 
               onClick={exportAnnotatedPdf}
               className="px-6 py-2 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"
             >
               <Download className="w-4 h-4" /> Export Annotated PDF
             </button>
           </div>
           
           <div 
             ref={pdfContainerRef}
             onClick={addAnnotation}
             className="relative bg-slate-200 rounded-[2rem] overflow-hidden shadow-inner flex flex-col items-center p-8 min-h-[800px] cursor-crosshair"
           >
             <Document
                file={initialPdfUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                className="shadow-2xl"
              >
                {Array.from(new Array(numPages || 0), (el, index) => (
                  <Page 
                    key={`page_${index + 1}`} 
                    pageNumber={index + 1} 
                    width={800}
                  />
                ))}
              </Document>

              {annotations.map(anno => (
                <div 
                  key={anno.id}
                  style={{ left: anno.x, top: anno.y }}
                  className="absolute z-20 group"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="relative">
                    <div className="w-4 h-4 bg-primary rounded-full shadow-lg cursor-move border-2 border-white" />
                    <input 
                      type="text"
                      autoFocus
                      value={anno.text}
                      onChange={e => {
                        const newAnnos = annotations.map(a => a.id === anno.id ? { ...a, text: e.target.value } : a);
                        setAnnotations(newAnnos);
                      }}
                      className="absolute left-6 -top-2 bg-white border border-slate-200 shadow-xl rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none min-w-[150px]"
                    />
                    <button 
                      onClick={() => setAnnotations(annotations.filter(a => a.id !== anno.id))}
                      className="absolute -right-16 -top-2 opacity-0 group-hover:opacity-100 bg-red-50 text-red-500 p-1.5 rounded-lg transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
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
              <div className="bg-slate-50 p-4 rounded-2xl text-sm text-slate-600 max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                {jobDescription || "No job description provided."}
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Actions
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => setLocation('/cv/pdf-editor')}
                  className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  <FileUp className="w-4 h-4" /> Upload PDF Instead
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving || !cvContent}
                  className="w-full py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                >
                  <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Final Draft"}
                </button>
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
