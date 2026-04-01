import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { TelephonyOverlay } from "@/components/telephony/TelephonyProvider";
import { SoftphoneProvider } from "@/contexts/SoftphoneContext";

export function MainLayout() {
  return (
    <SoftphoneProvider>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <div className="pl-64">
          <TopBar />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
        <TelephonyOverlay />
      </div>
    </SoftphoneProvider>
  );
}
