import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import GoalsPage from "./pages/GoalsPage";
import NewGoalPage from "./pages/NewGoalPage";
import TemplatesPage from "./pages/TemplatesPage";
import CommunityPage from "./pages/CommunityPage";
import SettingsPage from "./pages/SettingsPage";
import GoalDetailPage from "./pages/GoalDetailPage";
import InstallPage from "./pages/InstallPage";
import DailyHabitsPage from "./pages/DailyHabitsPage";
import WeeklyActionsPage from "./pages/WeeklyActionsPage";
import NotFound from "./pages/NotFound";
import AICoach from "./components/AICoach";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/goals/:id" element={<GoalDetailPage />} />
          <Route path="/new" element={<NewGoalPage />} />
          <Route path="/daily" element={<DailyHabitsPage />} />
          <Route path="/weekly" element={<WeeklyActionsPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AICoach />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
