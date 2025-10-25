import AdminPricingSettings from "@/components/admin/AdminPricingSettings";

export const metadata = {
  title: "Pricing & Plans | Admin",
  description: "Configure subscription pricing and plans",
};

export default function AdminPricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pricing & Plans</h1>
        <p className="text-muted-foreground mt-2">
          Configure subscription pricing for all plans
        </p>
      </div>

      <AdminPricingSettings />
    </div>
  );
}
