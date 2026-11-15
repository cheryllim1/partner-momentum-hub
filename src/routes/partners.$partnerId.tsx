import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DIRECTORY } from "@/lib/directory";
import { PartnerDetail } from "@/components/hub/PartnerDetail";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/partners/$partnerId")({
  loader: ({ params }) => {
    const partner = DIRECTORY.find((p) => p.id === params.partnerId);
    if (!partner) throw notFound();
    return partner;
  },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.name ?? "Partner unavailable"} | Partner Activation and Enablement Dashboard` },
    { name: "description", content: `Performance, contacts and tier enablement for ${loaderData?.name ?? "this partner"}.` },
    { property: "og:title", content: `${loaderData?.name ?? "Partner unavailable"} — Partner Profile` },
    { property: "og:description", content: "Partner performance, contacts, enablement and incentive overrides." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Profile,
});

function Profile() {
  const partner = Route.useLoaderData();
  return <div className="space-y-5">
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" size="sm" asChild><Link to="/"><ArrowLeft className="h-4 w-4" />Pipeline</Link></Button>
      <Button variant="ghost" size="sm" asChild><Link to="/enablement" search={{}}>Partner directory</Link></Button>
    </div>
    <PartnerDetail key={partner.id} partner={partner} />
  </div>;
}