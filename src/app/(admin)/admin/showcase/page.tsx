import { AdminShowcaseManager } from "@/components/admin/AdminShowcaseManager";

export const metadata = {
  title: "Manage Showcase Images | Admin",
  description: "Manage showcase images for the landing page hero section",
};

export default function AdminShowcasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Showcase Images</h1>
        <p className="text-muted-foreground mt-2">
          Manage the before/after comparison images displayed on the landing page hero section
        </p>
      </div>

      <AdminShowcaseManager />
    </div>
  );
}
