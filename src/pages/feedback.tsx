import {
  InfoIcon,
  TriangleAlertIcon,
  CircleCheckIcon,
  CheckIcon,
  BellIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Section, Row } from "@/components/showcase/section";

export default function FeedbackPage() {
  return (
    <Section
      title="Feedback"
      description="Alerts for inline messaging, Skeleton for loading, and toast for transient confirmations."
    >
      <Row label="Alerts">
        <div className="flex w-full flex-col gap-3">
          <Alert>
            <InfoIcon />
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>
              Your API key expires in 7 days. Rotate it from the settings page.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <TriangleAlertIcon />
            <AlertTitle>Rate limit exceeded</AlertTitle>
            <AlertDescription>
              You’ve sent 1,200 requests in the last minute. Slow down or upgrade your plan.
            </AlertDescription>
            <AlertAction>
              <Button size="sm" variant="outline">
                Upgrade
              </Button>
            </AlertAction>
          </Alert>
          <Alert className="border-border bg-secondary text-foreground">
            <CircleCheckIcon className="text-primary" />
            <AlertTitle>Deployment live</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Your product is now serving traffic from 14 regions.
            </AlertDescription>
          </Alert>
        </div>
      </Row>

      <Row label="Skeleton (loading)">
        <div className="flex w-full max-w-md flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
      </Row>

      <Row label="Toasts">
        <Button
          variant="outline"
          onClick={() => toast.success("Saved to your library.")}
        >
          <CheckIcon data-icon="inline-start" />
          Success toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.error("Couldn’t reach the inference endpoint.")
          }
        >
          <TriangleAlertIcon data-icon="inline-start" />
          Error toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("iPhone 17 Pro is now available for pre-order.", {
              description: "Read the release notes for what changed.",
            })
          }
        >
          <BellIcon data-icon="inline-start" />
          Info toast
        </Button>
      </Row>
    </Section>
  );
}
