import { TaibosiApp } from "../taibosi-app";

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  return <TaibosiApp path={`/${path.join("/")}`} />;
}
