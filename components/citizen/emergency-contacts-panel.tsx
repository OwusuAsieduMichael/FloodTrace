import Link from "next/link";
import { AlertTriangle, Camera, Phone } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmergencyContact } from "@/types";
import { telHref } from "@/lib/config/emergency-contacts";

interface EmergencyContactsPanelProps {
  contacts: EmergencyContact[];
  compact?: boolean;
}

export function EmergencyContactsPanel({
  contacts,
  compact = false,
}: EmergencyContactsPanelProps) {
  const configuredContacts = contacts.filter((contact) => contact.phone.trim());

  return (
    <div className="space-y-4">
      <Alert variant="warning">
        <AlertTriangle className="size-4" />
        <AlertTitle>For urgent life-threatening emergencies</AlertTitle>
        <AlertDescription>
          Dial <span className="font-medium text-foreground">112</span> immediately.
          It is Ghana&apos;s toll-free emergency number for Police, Fire, Ambulance,
          and NADMO. FloodTrace reports help authorities respond to flooding — they
          do not replace emergency services.
        </AlertDescription>
      </Alert>

      {configuredContacts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emergency contacts</CardTitle>
            <CardDescription>
              Contact numbers have not been configured yet. An administrator can
              add verified emergency numbers in system settings.
            </CardDescription>
          </CardHeader>
          {!compact ? (
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {contacts.map((contact) => (
                  <li key={contact.name}>
                    <span className="font-medium text-foreground">{contact.name}</span>
                    {" — "}
                    {contact.description}
                  </li>
                ))}
              </ul>
            </CardContent>
          ) : null}
        </Card>
      ) : (
        <div className={compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-2"}>
          {configuredContacts.map((contact) => (
            <Card key={contact.name} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{contact.name}</CardTitle>
                <CardDescription>{contact.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" render={<a href={telHref(contact.phone)} />}>
                  <Phone className="size-4" />
                  Call {contact.phone}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {compact ? (
        <Button variant="outline" size="sm" render={<Link href="/citizen/emergency" />}>
          View emergency assistance
        </Button>
      ) : null}
    </div>
  );
}

export function ReportHeroCta() {
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Primary action</p>
          <h2 className="text-xl font-semibold tracking-tight">Report a flood</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Capture live camera evidence with automatic GPS and timestamp. Your
            report goes directly to municipal authorities for verification.
          </p>
        </div>
        <Button size="lg" className="w-full shrink-0 sm:w-auto" render={<Link href="/citizen/report" />}>
          <Camera className="size-4" />
          Start report
        </Button>
      </CardContent>
    </Card>
  );
}
