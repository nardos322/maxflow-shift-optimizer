import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppLayout() {
    return (
        <div className="grain-layer flex min-h-screen flex-col bg-transparent md:flex-row">
            <Sidebar />
            <div className="flex min-h-screen flex-1 flex-col">
                <Header />
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
