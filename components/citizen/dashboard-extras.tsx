import Link from "next/link";
import { MapPinned, Radio } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface NearbyIncidentsCardProps {
  activeCount: number;
}

export function NearbyIncidentsCard({ activeCount }: NearbyIncidentsCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <Radio className="mb-2 size-5 text-primary" />
        <CardTitle className="text-base">Community incidents</CardTitle>
        <CardDescription>
          {activeCount > 0
            ? `${activeCount} verified or assigned incident${activeCount === 1 ? "" : "s"} visible on the public map.`
            : "No verified active incidents are visible on the public map right now."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" render={<Link href="/map" />}>
          <MapPinned className="size-4" />
          Open live map
        </Button>
      </CardContent>
    </Card>
  );
}

interface QuickLinksProps {
  unreadNotifications: number;
}

export function CitizenQuickLinks({ unreadNotifications }: QuickLinksProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>
            {unreadNotifications > 0
              ? `${unreadNotifications} unread update${unreadNotifications === 1 ? "" : "s"}.`
              : "No unread notifications."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" render={<Link href="/citizen/notifications" />}>
            Open notifications
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weather</CardTitle>
          <CardDescription>
            Local rainfall and conditions for your area — coming in Phase 12.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" render={<Link href="/citizen/weather" />}>
            View weather
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
