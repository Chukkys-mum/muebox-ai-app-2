import { FC, ReactNode, useState, useEffect, createContext, useContext, Component } from 'react';
import { cn } from '@/utils/cn';
import { Search, SearchProps } from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import EmailSidebar from '@/components/modules/email/EmailSidebar';
import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from '@/components/ui/resizable';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Plus,
  Menu,
  Mail,
  Search as SearchIcon,
  Loader2
} from 'lucide-react';

interface EmailContextType {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  selectedEmails: string[];
  setSelectedEmails: (emails: string[]) => void;
}

export const EmailContext = createContext<EmailContextType | null>(null);

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface EmailLayoutProps {
  children: ReactNode;
  page: 'inbox' | 'detail' | 'compose';
}

interface EmailPreviewPaneProps {}

const EmailPreviewPane: FC<EmailPreviewPaneProps> = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Email Preview</h3>
        <p className="text-sm text-muted-foreground">
          Select an email to view its preview here
        </p>
      </div>
    </div>
  );
};

const EmailLayout: FC<EmailLayoutProps> = ({ children, page }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    setLoading(false);

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        router.push('/dashboard/email/compose');
      }
      if (e.key === '/' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[type="search"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  if (!mounted) return null;
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={
      <div className="flex h-screen items-center justify-center">
        <p>Something went wrong. Please try refreshing the page.</p>
      </div>
    }>
      <EmailContext.Provider value={{ 
        sidebarWidth, 
        setSidebarWidth, 
        selectedEmails, 
        setSelectedEmails 
      }}>
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Button
                className="hidden lg:flex items-center"
                size="sm"
                asChild
              >
                <Link href="/dashboard/email/compose">
                  <Mail className="mr-2 h-4 w-4" />
                  Compose
                  <span className="ml-2 text-xs text-muted-foreground">
                    (⌘ + C)
                  </span>
                </Link>
              </Button>
              {page !== 'compose' && (
                <Button size="sm" className="lg:hidden" asChild>
                  <Link href="/dashboard/email/compose">
                    <span className="sr-only">Compose</span>
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
            <div className="flex-1 mx-4 max-w-xl">
              <Search 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emails... (⌘ + /)"
              />
            </div>
          </div>

          <ResizablePanelGroup direction="horizontal">
            {/* Sidebar */}
            <ResizablePanel
              defaultSize={20}
              minSize={15}
              maxSize={30}
              className={cn(
                "border-r bg-background hidden lg:block",
                "overflow-y-auto"
              )}
            >
              <EmailSidebar />
            </ResizablePanel>

            {/* Mobile Sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetContent side="left" className="p-0 w-72">
                <EmailSidebar onClose={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>

            <ResizableHandle withHandle />

            {/* Main Content */}
            <ResizablePanel defaultSize={page === 'detail' ? 50 : 80}>
              <main className="h-full overflow-y-auto bg-background">
                <div className="container mx-auto p-4">
                  {children}
                </div>
              </main>
            </ResizablePanel>

            {/* Optional Preview Pane for Detail View */}
            {page === 'detail' && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} className="hidden 2xl:block">
                  <aside className="h-full border-l bg-background overflow-y-auto">
                    <div className="p-4">
                      <EmailPreviewPane />
                    </div>
                  </aside>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </EmailContext.Provider>
    </ErrorBoundary>
  );
};

export default EmailLayout;