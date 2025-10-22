import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Image, LogOut, Settings } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not authenticated or not admin
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/showcase");
  }

  const isAdmin = (session.user as any).isAdmin;

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold">VectorCraft Admin</h1>
              <nav className="flex items-center gap-4">
                <Link href="/admin/showcase">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Image className="h-4 w-4" />
                    Showcase Images
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  Back to Site
                </Button>
              </Link>
              <form action="/api/auth/signout" method="POST">
                <Button variant="outline" size="sm" className="gap-2" type="submit">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
      <Toaster />
    </div>
  );
}
