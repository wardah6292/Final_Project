import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Welcome from "@/pages/Welcome";
import Onboarding from "@/pages/Onboarding";
import CVSetup from "@/pages/CVSetup";
import CLSetup from "@/pages/CLSetup";
import Dashboard from "@/pages/Dashboard";
import ApplicationTracker from "@/pages/ApplicationTracker";
import Documents from "@/pages/Documents";
import JobAnalysis from "@/pages/JobAnalysis";
import CVImprove from "@/pages/CVImprove";
import CvDraftEditor from "@/pages/CvDraftEditor";
import CvPdfEditor from "@/pages/CvPdfEditor";
import CoverLetterGenerator from "@/pages/CoverLetterGenerator";
import SharePage from "@/pages/SharePage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/onboarding/step/:step" component={Onboarding} />
      <Route path="/setup-cv" component={CVSetup} />
      <Route path="/setup-cl" component={CLSetup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/tracker" component={ApplicationTracker} />
      <Route path="/documents" component={Documents} />
      <Route path="/analysis" component={JobAnalysis} />
      <Route path="/cv-improve" component={CVImprove} />
      <Route path="/cv/pdf-editor" component={CvDraftEditor} />
      <Route path="/cv/pdf" component={CvPdfEditor} />
      <Route path="/cover-letter" component={CoverLetterGenerator} />
      <Route path="/share/:id" component={SharePage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
