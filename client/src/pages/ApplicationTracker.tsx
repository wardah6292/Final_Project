import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useApplications, useCreateApplication, useUpdateApplication, useDeleteApplication } from "@/hooks/use-applications";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreVertical, Trash2, ExternalLink, Calendar, Building, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApplicationSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";

const statuses = ["Saved", "Applied", "Interview", "Rejected"];

const statusColors: Record<string, string> = {
  Saved: "bg-slate-100 text-slate-600 border-slate-200",
  Applied: "bg-blue-50 text-blue-600 border-blue-200",
  Interview: "bg-purple-50 text-purple-600 border-purple-200",
  Rejected: "bg-red-50 text-red-600 border-red-200",
};

export default function ApplicationTracker() {
  const [, setLocation] = useLocation();
  const { data: applications, isLoading } = useApplications();
  const deleteApp = useDeleteApplication();
  const updateApp = useUpdateApplication();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this application?")) {
      deleteApp.mutate(id, {
        onSuccess: () => toast({ title: "Deleted", description: "Application removed successfully." })
      });
    }
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    updateApp.mutate({ id, status: newStatus });
  };

  return (
    <Layout>
      <div className="mb-6">
        <button onClick={() => setLocation('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      <PageHeader 
        title="Application Tracker" 
        description="Manage your job applications and track your progress."
        action={
          <div onClick={() => setIsCreateOpen(true)} className="btn-bounce cursor-pointer flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90">
            <Plus className="w-5 h-5" />
            Add Application
          </div>
        }
      />
      
      <CreateApplicationDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 font-bold text-slate-600 text-sm">Role</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-sm">Company</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-sm">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-sm">Added</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {applications?.map((app) => (
                    <motion.tr
                      key={app.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group border-b border-slate-50 hover:bg-indigo-50/30 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 text-primary rounded-xl shrink-0">
                            <Building className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-800">{app.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-slate-500 font-medium">{app.company}</span>
                      </td>
                      <td className="px-6 py-5">
                        <select 
                          className={`text-xs font-bold rounded-lg py-1.5 px-3 border-none cursor-pointer outline-none focus:ring-2 ring-primary/20 shadow-sm ${statusColors[app.status]}`}
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        >
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-5 text-slate-400 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(app.createdAt || new Date()), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => handleDelete(app.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {(!applications || applications.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">
                      No applications tracked yet. Click "Add Application" to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}

// Separate component for the dialog form
function CreateApplicationDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const createMutation = useCreateApplication();
  const { toast } = useToast();
  
  const formSchema = z.object({
    company: z.string().min(1, "Company is required"),
    role: z.string().min(1, "Role is required"),
    status: z.string(),
    userId: z.number().default(1), // Hardcoded for prototype
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "Saved",
      userId: 1
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Success", description: "Application added!" });
        onOpenChange(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">Add Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input {...form.register("company")} placeholder="e.g. Acme Corp" className="rounded-xl border-slate-200 focus:ring-primary h-12" />
            {form.formState.errors.company && <p className="text-red-500 text-sm">{form.formState.errors.company.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Role Title</Label>
            <Input {...form.register("role")} placeholder="e.g. Frontend Engineer" className="rounded-xl border-slate-200 focus:ring-primary h-12" />
            {form.formState.errors.role && <p className="text-red-500 text-sm">{form.formState.errors.role.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Current Status</Label>
            <Select onValueChange={(val) => form.setValue("status", val)} defaultValue="Saved">
              <SelectTrigger className="rounded-xl h-12 border-slate-200">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <button 
            type="submit" 
            disabled={createMutation.isPending}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {createMutation.isPending ? "Adding..." : "Add Application"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
