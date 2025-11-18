import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar"; // Navbar ko yaha import karein

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Programs from "./pages/Programs";
import Internships from "./pages/Internships";
import Insights from "./pages/Insights";
import About from "./pages/About";
import IdeaGenerator from "./pages/IdeaGenerator";
import NotFound from "./pages/NotFound";
import { AuthenticatedAIAssistant } from "./components/AuthenticatedAIAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/idea-generator" element={<IdeaGenerator />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AuthenticatedAIAssistant />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;



// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Index />} />
//           <Route path="/programs" element={<Programs />} />
//           <Route path="/internships" element={<Internships />} />
//           <Route path="/insights" element={<Insights />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/idea-generator" element={<IdeaGenerator />} />
//           {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//         <AuthenticatedAIAssistant />
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// );
