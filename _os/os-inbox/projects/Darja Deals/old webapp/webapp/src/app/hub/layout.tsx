export default function HubLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Hub uses a minimal layout - no LayoutWrapper
    // This gives us a fullscreen, no-scroll experience
    return (
        <div className="fixed inset-0 overflow-hidden">
            {children}
        </div>
    );
}
