import { PlayerPageClient } from "@/components/player/PlayerPageClient";

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlayerPageClient id={id} />;
}
