import Workspace from "@/components/solar/workspace";
export default async function SolarDesignPage({ params }: { params: Promise<{ id: string }> }) {
  return <Workspace id={(await params).id} />;
}
