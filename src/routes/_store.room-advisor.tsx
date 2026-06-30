import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_store/room-advisor")({
  component: RoomAdvisorLayout,
});

function RoomAdvisorLayout() {
  return <Outlet />;
}
