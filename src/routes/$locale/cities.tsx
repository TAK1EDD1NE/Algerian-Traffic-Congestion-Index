import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CityReport } from "@/components/data/CityReport";
import { PageState } from "@/components/site/Panel";
import { datasetQuery } from "@/lib/traffic";

export const Route = createFileRoute("/$locale/cities")({
  head: () => ({
    meta: [
      { title: "City Reports — Algeria Urban Congestion Index" },
      {
        name: "description",
        content:
          "Detailed congestion report for each Algerian city: hourly profile, weekly heatmap, road-network coverage and area-by-area breakdown.",
      },
      { property: "og:title", content: "City Reports — Algeria Urban Congestion Index" },
      {
        property: "og:description",
        content: "Per-city congestion reports for the Algerian urban congestion index.",
      },
    ],
  }),
  component: CitiesPage,
});

const DEFAULT_CITY = "Alger";

function CitiesPage() {
  const { data, isLoading, error } = useQuery(datasetQuery);
  const [cityName, setCityName] = useState(DEFAULT_CITY);

  if (isLoading || error || !data)
    return <PageState loading={isLoading} error={error as Error | null} />;

  const city = data.cities.find((c) => c.city === cityName) ?? data.cities[0]!;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <CityReport data={data} city={city} onSelectCity={setCityName} />
    </main>
  );
}
