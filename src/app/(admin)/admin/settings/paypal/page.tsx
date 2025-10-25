import AdminPayPalSettings from "@/components/admin/AdminPayPalSettings";

export const metadata = {
  title: "PayPal Configuration | Admin",
  description: "Configure PayPal API credentials for payment processing",
};

export default function AdminPayPalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">PayPal Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Configure PayPal API credentials for payment processing
        </p>
      </div>

      <AdminPayPalSettings />
    </div>
  );
}
