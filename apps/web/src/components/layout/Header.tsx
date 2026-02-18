export function Header() {
    return (
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">Bienvenido al panel de control</span>
            </div>

            <div className="flex items-center gap-4">
                {/* Placeholder for future header items like notifications or search */}
            </div>
        </header>
    );
}
