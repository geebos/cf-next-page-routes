import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Section, Row } from "@/components/showcase/section";

export default function CardsPage() {
  return (
    <Section
      title="Cards"
      description="Alternating light and dark product tiles (edge-to-edge, no radius) plus a standard utility card at 18px radius."
    >
      <Row label="Product tiles">
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex h-56 flex-col justify-between rounded-none bg-background p-6 text-foreground">
            <Badge className="w-fit bg-primary/10 text-primary">NEW</Badge>
            <div>
              <div className="font-heading text-[40px] font-semibold leading-[1.1]">iPhone 17 Pro</div>
              <p className="mt-1 text-[14px] text-muted-foreground">Titanium flagship</p>
            </div>
          </div>
          <div className="flex h-56 flex-col justify-between rounded-none bg-[#272729] p-6 text-white">
            <Badge className="w-fit bg-white/10 text-white">AUDIO</Badge>
            <div>
              <div className="font-heading text-[32px] font-semibold leading-[1.1]">AirPods 4</div>
              <p className="mt-1 text-[14px] text-white/80">Active noise cancellation</p>
            </div>
          </div>
          <div className="flex h-56 flex-col justify-between rounded-none bg-secondary p-6 text-foreground">
            <Badge className="w-fit bg-primary/10 text-primary">WATCH</Badge>
            <div>
              <div className="font-heading text-[32px] font-semibold leading-[1.1]">Apple Watch</div>
              <p className="mt-1 text-[14px] text-muted-foreground">Health & fitness</p>
            </div>
          </div>
          <div className="flex h-56 flex-col justify-between rounded-none bg-[#2a2a2c] p-6 text-white">
            <Badge className="w-fit bg-white/10 text-white">SPATIAL</Badge>
            <div>
              <div className="font-heading text-[32px] font-semibold leading-[1.1]">Vision Pro</div>
              <p className="mt-1 text-[14px] text-white/80">Spatial computing</p>
            </div>
          </div>
        </div>
      </Row>

      <Row label="Standard card">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Token plan</CardTitle>
            <CardDescription>
              Pay-as-you-go pricing across every Apple product.
            </CardDescription>
            <CardAction>
              <Badge className="bg-primary text-white">NEW</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-3xl font-semibold">$0.70</span>
              <span className="text-sm text-muted-foreground">/ 1M input tokens</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Includes 1M context window, JSON mode, and tool use.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Subscribe</Button>
          </CardFooter>
        </Card>
      </Row>
    </Section>
  );
}
