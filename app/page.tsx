import PrepDashboard from "@/components/PrepDashboard";
import { getAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getAppData();
  return <PrepDashboard initialData={data} />;
}
