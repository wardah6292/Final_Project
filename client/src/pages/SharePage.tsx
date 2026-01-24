import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { FileText, Building, User, Calendar, Download, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Document, Page, pdfjs } from "react-pdf";
import { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function SharePage() {
  const { id } = useParams();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const isPdf = searchParams.get('isPdf') === 'true';
  const pdfUrl = searchParams.get('pdfUrl');
  const annos = JSON.parse(searchParams.get('annos') || '[]');
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: document, isLoading, error } = useQuery<any>({
    queryKey: [`/api/documents/${id}`],
    enabled: !!id && !isPdf
  });

  const exportPdf = async () => {
    if (!pdfContainerRef.current) return;
    const canvas = await html2canvas(pdfContainerRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('shared_annotated_cv.pdf');
  };

  if (isLoading && !isPdf) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse text-slate-400 font-bold">Loading shareable draft...</div>
    </div>
  );

  if ((error || !document) && !isPdf) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-slate-400 font-bold">This share link is invalid or has expired.</div>
    </div>
  );

  if (isPdf && pdfUrl) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center bg-indigo-900 text-white p-6 rounded-[2rem] shadow-lg">
            <div>
              <h1 className="text-2xl font-bold">Shared Annotated PDF</h1>
              <p className="text-sm text-indigo-100 italic">View-only mode</p>
            </div>
            <button 
              onClick={exportPdf}
              className="px-6 py-2 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>

          <div 
            ref={pdfContainerRef}
            className="relative bg-white rounded-[2rem] p-8 shadow-xl overflow-hidden flex flex-col items-center min-h-[800px]"
          >
            <Document file={pdfUrl} className="shadow-lg">
              <Page pageNumber={1} width={800} renderAnnotationLayer={false} renderTextLayer={false} />
            </Document>

            {annos.map((anno: any) => (
              <div 
                key={anno.id}
                style={{ left: anno.x, top: anno.y }}
                className="absolute z-10 p-2 bg-white/90 border border-slate-200 shadow-lg rounded-lg"
              >
                <span className="font-bold text-slate-800 text-sm">{anno.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] p-4 md:p-12">
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-900 p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <FileText className="w-3 h-3" /> Shared {document.type === 'cv' ? 'CV' : 'Cover Letter'}
            </div>
            <h1 className="text-3xl font-bold">{document.name}</h1>
          </div>
          <div className="flex items-center gap-3 text-indigo-200 text-sm font-medium">
            <Calendar className="w-4 h-4" />
            Created {format(new Date(document.createdAt), 'MMMM d, yyyy')}
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="prose prose-slate max-w-none">
            <pre className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-slate-800 bg-transparent border-none p-0 focus:outline-none">
              {document.content}
            </pre>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-sm">
            This is a read-only preview generated by <span className="font-bold text-primary">Career Companion</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
