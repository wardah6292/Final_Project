import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useDocuments, useCreateDocument, useDeleteDocument } from "@/hooks/use-documents";
import { motion } from "framer-motion";
import { FileText, Plus, Trash2, FileType, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";

export default function Documents() {
  const [, setLocation] = useLocation();
  const { data: documents, isLoading } = useDocuments();
  const deleteDoc = useDeleteDocument();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDelete = (id: number) => {
    if (confirm("Delete this document?")) {
      deleteDoc.mutate(id, {
        onSuccess: () => toast({ title: "Deleted", description: "Document removed." })
      });
    }
  };

  const cvs = documents?.filter(d => d.type === 'cv') || [];
  const letters = documents?.filter(d => d.type === 'cover_letter') || [];

  return (
    <Layout>
      <div className="mb-6">
        <button onClick={() => setLocation('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      <PageHeader 
        title="Documents" 
        description="Store your CVs and Cover Letters for quick access."
        action={
          <div onClick={() => setIsCreateOpen(true)} className="btn-bounce cursor-pointer flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90">
            <Plus className="w-5 h-5" />
            Upload / Paste
          </div>
        }
      />

      <CreateDocumentDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <Tabs defaultValue="cv" className="w-full">
        <TabsList className="mb-8 p-1 bg-slate-100 rounded-xl h-auto">
          <TabsTrigger value="cv" className="rounded-lg py-2.5 px-6 font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">CVs / Resumes</TabsTrigger>
          <TabsTrigger value="cl" className="rounded-lg py-2.5 px-6 font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">Cover Letters</TabsTrigger>
        </TabsList>

        <TabsContent value="cv">
          <DocumentGrid docs={cvs} onDelete={handleDelete} type="CV" />
        </TabsContent>
        <TabsContent value="cl">
          <DocumentGrid docs={letters} onDelete={handleDelete} type="Cover Letter" />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

function DocumentGrid({ docs, onDelete, type }: { docs: any[], onDelete: (id: number) => void, type: string }) {
  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
          <FileText className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">No {type}s found yet.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {docs.map((doc, idx) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 text-primary rounded-2xl">
              <FileType className="w-6 h-6" />
            </div>
            <button onClick={() => onDelete(doc.id)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-1 truncate">{doc.name}</h3>
          <p className="text-sm text-slate-400 mb-4">
            Added {format(new Date(doc.createdAt), 'MMM d, yyyy')}
          </p>
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl line-clamp-3 font-mono">
            {doc.content.substring(0, 150)}...
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CreateDocumentDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const createMutation = useCreateDocument();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("cv");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      content,
      type,
      userId: 1
    }, {
      onSuccess: () => {
        toast({ title: "Saved", description: "Document created successfully." });
        onOpenChange(false);
        setName("");
        setContent("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">Add Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Document Name</Label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Frontend CV 2024" 
                className="rounded-xl border-slate-200 focus:ring-primary h-12" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value)}
                className="w-full h-12 rounded-xl border border-slate-200 px-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="cv">CV / Resume</option>
                <option value="cover_letter">Cover Letter</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Paste Content (Plain Text)</Label>
            <Textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              placeholder="Paste your document text here..." 
              className="rounded-xl border-slate-200 focus:ring-primary min-h-[200px] font-mono text-sm"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={createMutation.isPending}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {createMutation.isPending ? "Saving..." : "Save Document"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
