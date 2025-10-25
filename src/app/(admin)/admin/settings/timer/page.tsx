import AdminTimerSettings from "@/components/admin/AdminTimerSettings";

export const metadata = {
  title: "Countdown Timer Settings | Admin",
  description: "Configure countdown timer for landing page",
};

export default function AdminTimerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Countdown Timer</h1>
        <p className="text-muted-foreground mt-2">
          Configure the countdown timer displayed on the landing page
        </p>
      </div>

      <AdminTimerSettings />
    </div>
  );
}
