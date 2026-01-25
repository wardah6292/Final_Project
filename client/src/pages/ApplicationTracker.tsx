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
        <div className="grid md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />)}
        </div>
      ) : (
        <div className="overflow-x-auto pb-8">
          <div className="flex gap-6 min-w-[1000px]">
            {statuses.map((status) => {
              const columnApps = applications?.filter(a => a.status === status) || [];
              
              return (
                <div key={status} className="flex-1 min-w-[280px]">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-bold text-slate-700">{status}</h3>
                    <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-500">{columnApps.length}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <AnimatePresence>
                      {columnApps.map((app) => (
                        <motion.div
                          key={app.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 relative"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="p-2 bg-indigo-50 text-primary rounded-xl">
                              <Building className="w-5 h-5" />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleDelete(app.id)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <h4 className="font-bold text-slate-800 text-lg mb-1">{app.role}</h4>
                          <p className="text-slate-500 font-medium text-sm mb-4">{app.company}</p>
                          
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(app.createdAt || new Date()), 'MMM d')}
                            </span>
                            
                            {/* Quick Status Mover (Simple dropdown for prototype) */}
                            <select 
                              className="text-xs bg-slate-50 border-none rounded-lg py-1 pl-2 pr-1 cursor-pointer outline-none focus:ring-2 ring-primary/20"
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            >
                              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {columnApps.length === 0 && (
                      <div className="h-32 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 text-sm font-medium">
                        No applications
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
