import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

/**
 * City picker for the report header. Radix Select (already a dependency) replaces
 * the native <select> so the list can be styled with the panel system, capped in
 * height and scrolled instead of overflowing the viewport with 27 options.
 */
export function CitySwitcher({
  cities,
  value,
  onSelect,
}: {
  cities: string[];
  value: string;
  onSelect: (city: string) => void;
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onSelect}>
      <SelectPrimitive.Trigger
        aria-label="Switch city"
        className="group flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-semibold outline-none transition-colors hover:bg-secondary data-[state=open]:border-signal"
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          align="end"
          sideOffset={6}
          className="z-50 max-h-[min(14rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-float"
        >
          <SelectPrimitive.Viewport className="max-h-[14rem] overflow-y-auto overscroll-contain p-1">
            {cities.map((c) => (
              <SelectPrimitive.Item
                key={c}
                value={c}
                className="relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-2.5 pr-8 text-sm outline-none data-[highlighted]:bg-secondary data-[state=checked]:font-semibold"
              >
                <SelectPrimitive.ItemText>{c}</SelectPrimitive.ItemText>
                <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center text-signal">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-3.5 w-3.5" />
                  </SelectPrimitive.ItemIndicator>
                </span>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
