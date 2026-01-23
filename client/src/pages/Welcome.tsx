import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Welcome() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm font-semibold text-primary">
            <Sparkles className="w-4 h-4" />
            <span>Your Personal Career AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] text-slate-900">
            Career <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              Companion
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 leading-relaxed">
            The friendly way to organize your job search. Track applications, 
            analyze job fit, and write stellar cover letters—all in one place.
          </p>

          <Link href="/onboarding/step/1">
            <button className="btn-bounce group flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:bg-primary/90 transition-all">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden md:block relative"
        >
          {/* Friendly image using Unsplash */}
          {/* woman working happily on laptop with coffee in bright room */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60" 
              alt="Happy person working" 
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          
          {/* Floating badges */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">Fit Score</div>
              <div className="text-xs text-slate-500">95% Match</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
