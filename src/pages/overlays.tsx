import { useState } from "react";
import {
  PlusIcon,
  ChevronDownIcon,
  UserIcon,
  CopyIcon,
  DownloadIcon,
  Trash2Icon,
  MoreHorizontalIcon,
  FilterIcon,
  StarIcon,
  InfoIcon,
  CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Section, Row } from "@/components/showcase/section";

export default function OverlaysPage() {
  const [sliderInDialog, setSliderInDialog] = useState<number[]>([25]);

  return (
    <Section
      title="Overlays"
      description="Dialog for modal flows, DropdownMenu for action menus, Tooltip for inline hints."
    >
      <Row label="Dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon data-icon="inline-start" />
              New deployment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pre-order iPhone 17 Pro</DialogTitle>
              <DialogDescription>
                Pick a name and an initial temperature for your deployment.
                You can change these later.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="deploy-name">Deployment name</Label>
                <Input id="deploy-name" defaultValue="prod-iphone-17-pro" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="deploy-temp">Temperature</Label>
                  <span className="text-xs text-muted-foreground">
                    {sliderInDialog[0] / 100}
                  </span>
                </div>
                <Slider
                  id="deploy-temp"
                  value={sliderInDialog}
                  onValueChange={setSliderInDialog}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  toast.success("Deployment queued.");
                }}
              >
                Deploy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Row>

      <Row label="Dropdown menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Actions
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Model</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserIcon /> Open profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CopyIcon /> Copy API key
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DownloadIcon /> Export logs
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2Icon /> Delete deployment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <FilterIcon /> Filter rows
            </DropdownMenuItem>
            <DropdownMenuItem>
              <StarIcon /> Pin to top
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Row>

      <Row label="Tooltip">
        <TooltipProvider>
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Info">
                  <InfoIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Token usage resets on the 1st of each month.
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Calendar">
                  <CalendarIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                View your billing cycle
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </Row>
    </Section>
  );
}
