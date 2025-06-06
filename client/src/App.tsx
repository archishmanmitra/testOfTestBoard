
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserProvider } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUser } from "@/contexts/UserContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import MDDashboard from "./pages/MDDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DesignDashboard from "./pages/DesignDashboard";
import ClientManagerDashboard from "./pages/ClientManagerDashboard";
import StoreDashboard from "./pages/StoreDashboard";
import AccountsDashboard from "./pages/AccountsDashboard";
import SiteDashboard from "./pages/SiteDashboard";
import ClientPortal from "./pages/ClientPortal";

// ERP Module Pages
import Projects from "./pages/Projects";
import HR from "./pages/HR";
import Inventory from "./pages/Inventory";
import Documents from "./pages/Documents";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

// New ERP Feature Pages
import TenderManagement from "./pages/TenderManagement";
import BillingManagement from "./pages/BillingManagement";
import PurchaseManagement from "./pages/PurchaseManagement";


const queryClient = new QueryClient();

const AppLayout = () => {
  const { user } = useUser();
  if (!user) return <Navigate to="/login" />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4">
              {/* <SidebarTrigger /> */}
              <div className="ml-auto flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Construction Management System
                </span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <Routes>
              <Route index element={<Index />} />
              <Route path="/md-dashboard" element={<MDDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/design-dashboard" element={<DesignDashboard />} />
              <Route path="/client-manager" element={<ClientManagerDashboard />} />
              <Route path="/store-manager" element={<StoreDashboard />} />
              <Route path="/accounts-manager" element={<AccountsDashboard />} />
              <Route path="/site-manager" element={<SiteDashboard />} />
              <Route path="/client-portal" element={<ClientPortal />} />
              
              {/* ERP module pages */}
              <Route path="/projects" element={<Projects />} />
              <Route path="/hr" element={<HR />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              
              {/* New ERP feature pages */}
              <Route path="/tender-management" element={<TenderManagement />} />
              <Route path="/billing-management" element={<BillingManagement />} />
              <Route path="/purchase-management" element={<PurchaseManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <UserProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </UserProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
