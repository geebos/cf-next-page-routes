import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Select, type SelectOption } from "@/components/select";
import { Section, Row } from "@/components/showcase/section";

const modelOptions: SelectOption[] = [
  {
    value: "iphone-17-pro",
    label: "iPhone 17 Pro",
    description: "Titanium flagship",
  },
  {
    value: "airpods-4",
    label: "AirPods 4",
    description: "Active noise cancellation",
  },
  {
    value: "watch-series-11",
    label: "Apple Watch Series 11",
    description: "Health & fitness",
  },
  {
    value: "vision-pro",
    label: "Apple Vision Pro",
    description: "Spatial computing",
    disabled: true,
  },
];

const toneOptions: SelectOption[] = [
  { value: "natural", label: "Natural Titanium" },
  { value: "blue", label: "Blue Titanium" },
  { value: "white", label: "White Titanium" },
  { value: "black", label: "Black Titanium" },
];

export default function SelectPage() {
  const [singleModel, setSingleModel] = useState("iphone-17-pro");
  const [multiTones, setMultiTones] = useState<string[]>(["warm", "bright"]);

  return (
    <Section
      title="Select"
      description="A custom Select built on Combobox. Supports single and multiple modes, search, descriptions, and disabled options."
    >
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="single-model">Single select</Label>
          <Select
            options={modelOptions}
            value={singleModel}
            onValueChange={setSingleModel}
            placeholder="Pick a model"
            searchPlaceholder="Search models"
            aria-label="Single select model"
          />
          <p className="text-xs text-muted-foreground">
            Selected: <span className="font-medium text-foreground">{singleModel || "—"}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="multi-tone">Multi-select with chips</Label>
          <Select
            multiple
            clearButton
            options={toneOptions}
            value={multiTones}
            onValueChange={setMultiTones}
            placeholder="Pick tones"
            searchPlaceholder="Search tones"
            aria-label="Multi select tones"
          />
          <p className="text-xs text-muted-foreground">
            Selected: <span className="font-medium text-foreground">
              {multiTones.length ? multiTones.join(", ") : "—"}
            </span>
          </p>
        </div>
      </div>

      <Row label="States">
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Label htmlFor="disabled-select">Disabled</Label>
          <Select
            options={modelOptions}
            disabled
            placeholder="Cannot pick"
            aria-label="Disabled select"
          />
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Label htmlFor="default-select">Uncontrolled (default)</Label>
          <Select
            options={modelOptions}
            defaultValue="hailuo"
            placeholder="Pick a model"
            aria-label="Uncontrolled select"
          />
        </div>
      </Row>
    </Section>
  );
}
