import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import DashboardHome from "./pages/dashboard/Home";
import SettingsPage from "./pages/dashboard/Settings";
import PlaceholderPage from "./pages/dashboard/Placeholder";
import ResultsPage from "./pages/dashboard/Results";
import MyClasses from "./pages/dashboard/MyClasses";
import Profile from "./pages/dashboard/Profile";
import Attendance from "./pages/dashboard/Attendance";
import Marks from "./pages/dashboard/Marks";
import StudentList from "./pages/dashboard/StudentList";
import Students from "./pages/dashboard/Students";
import Teachers from "./pages/dashboard/Teachers";
import Timetable from "./pages/dashboard/Timetable";
import Classes from "./pages/dashboard/Classes";
import Subjects from "./pages/dashboard/Subjects";
import IDCards from "./pages/dashboard/IDCards";
import ExamSchedule from "./pages/dashboard/ExamSchedule";
import Fees from "./pages/dashboard/Fees";
import { AppProvider } from "./context/AppContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/students"
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/teachers"
              element={
                <ProtectedRoute>
                  <Teachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/classes"
              element={
                <ProtectedRoute>
                  <Classes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/subjects"
              element={
                <ProtectedRoute>
                  <Subjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/timetable"
              element={
                <ProtectedRoute>
                  <Timetable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/results"
              element={
                <ProtectedRoute>
                  <ResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/my-classes"
              element={
                <ProtectedRoute>
                  <MyClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/attendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/marks"
              element={
                <ProtectedRoute>
                  <Marks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/class/:classId/students"
              element={
                <ProtectedRoute>
                  <StudentList />
                </ProtectedRoute>
              }
            />
                    <Route
                      path="/dashboard/id-cards"
                      element={
                        <ProtectedRoute>
                          <IDCards />
                        </ProtectedRoute>
                      }
                    />
            <Route
              path="/dashboard/exam-schedule"
              element={
                <ProtectedRoute>
                  <ExamSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/fees"
              element={
                <ProtectedRoute adminOnly>
                  <Fees />
                </ProtectedRoute>
              }
            />

            {/* CATCH ALL */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
