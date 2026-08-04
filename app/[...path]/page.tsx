import { TaibosiApp } from "../taibosi-app";

export default async function CatchAllPage({
  params,
  searchParams,
}: {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { path } = await params;
  const query = await searchParams;
  const value = (key: string) => typeof query[key] === "string" ? query[key] : undefined;
  return <TaibosiApp path={`/${path.join("/")}`} vehicleQuery={{
    maker: value("maker"),
    model: value("model"),
    generation: value("generation"),
    year: value("year"),
    engine: value("engine"),
    specification: value("specification"),
    condition: value("condition"),
  }} />;
}
