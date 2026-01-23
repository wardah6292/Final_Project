import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, GraduationCap, Briefcase, Search, Code, Palette, LineChart } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const steps = [
  {
    id: 1,
    question: "Which best describes you?",
    options: [
      { id: "student", label: "Student", icon: GraduationCap },
      { id: "graduate", label: "Recent Graduate", icon: Briefcase },
      { id: "experienced", label: "Experienced Pro", icon: Search },
    ]
  },
  {
    id: 2,
    question: "What are you looking for?",
    options: [
      { id: "internship", label: "Internship", icon: Code }, // Just reused icons for variety
      { id: "fulltime", label: "Full-time Role", icon: Palette },
      { id: "contract", label: "Freelance/Contract", icon: LineChart },
    ]
  }
];

export default function Onboarding() {
  const { step } = useParams();
  const [, setLocation] = useLocation();
  const currentStep = parseInt(step || "1");
  const stepData = steps.find(s => s.id === currentStep);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (optionId: string) => {
    const newAnswers = { ...answers, [currentStep]: optionId };
    setAnswers(newAnswers);
    
    // Simulate delay for smooth feel
    setTimeout(() => {
      if (currentStep < steps.length) {
        setLocation(`/onboarding/step/${currentStep + 1}`);
      } else {
        // Finish onboarding
        localStorage.setItem("career_companion_user", JSON.stringify(newAnswers));
        setLocation("/dashboard");
      }
    }, 400);
  };

  if (!stepData) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-200 rounded-full mb-12 overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-12">{stepData.question}</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {stepData.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-primary/20 flex flex-col items-center gap-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center">
                    <option.icon className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-lg text-slate-700">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
