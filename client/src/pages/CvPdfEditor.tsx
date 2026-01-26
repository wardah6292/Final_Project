import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useLocation } from "wouter";
import { ArrowLeft, Download, FileWarning, FileUp } from "lucide-react";
import { useState } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function CvPdfEditor() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const pdfUrl = searchParams.get('url');
  const fileName = searchParams.get('name') || 'CV.pdf';
  
  const [numPages, setNumPages] = useState<number | null>(null);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="mb-6">
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <PageHeader 
        title="CV PDF Editor" 
        description="View your uploaded CV PDF. Editing is limited in this prototype."
      />

      {!pdfUrl ? (
        <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
            <FileWarning className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">No PDF Content Found</h3>
          <p className="text-slate-500 text-lg">
            We can’t open the PDF because only the filename was saved. Please re-upload your CV PDF to view it.
          </p>
          <button
            onClick={() => setLocation('/cv/improve')}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2 mx-auto"
          >
            <FileUp className="w-5 h-5" /> Re-upload CV
          </button>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
          <div className="flex justify-between items-center bg-indigo-900 text-white p-6 rounded-[2rem] shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <FileUp className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <h4 className="font-bold">{fileName}</h4>
                <p className="text-sm text-indigo-200">{numPages || '...'} pages</p>
              </div>
            </div>
            <button 
              onClick={handleDownload}
              className="px-6 py-3 bg-white text-indigo-900 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>

          <div className="bg-slate-200 rounded-[2rem] overflow-hidden shadow-inner flex flex-col items-center p-8 min-h-[600px]">
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              className="shadow-2xl"
              loading={
                <div className="py-20 text-slate-500 font-medium">Loading PDF...</div>
              }
              error={
                <div className="py-20 text-red-500 font-medium">Failed to load PDF. Please try re-uploading.</div>
              }
            >
              {Array.from(new Array(numPages || 0), (el, index) => (
                <Page 
                  key={`page_${index + 1}`} 
                  pageNumber={index + 1} 
                  width={800}
                  className="mb-8"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              ))}
            </Document>
          </div>
        </div>
      )}
    </Layout>
  );
}
