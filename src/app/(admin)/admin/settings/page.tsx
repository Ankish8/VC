import { redirect } from "next/navigation";

export default function AdminSettingsPage() {
  // Redirect to the timer settings page
  redirect("/admin/settings/timer");
}
