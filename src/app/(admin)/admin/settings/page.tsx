import AdminTimerSettings from "@/components/admin/AdminTimerSettings";

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Site Settings</h1>
        <p className="text-slate-600">
          Manage countdown timers, subscription plans, and other site-wide settings
        </p>
      </div>

      <AdminTimerSettings />
    </div>
  );
}
