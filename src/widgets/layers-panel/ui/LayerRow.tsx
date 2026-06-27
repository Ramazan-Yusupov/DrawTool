import { Check } from "lucide-react";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib";
import type { BoardLayer } from "../model/getLayers";

type LayerRowProps = { layer: BoardLayer; isSelected: boolean; onSelect: (id: string) => void };

/** Clickable row representing one scene element in layer order. */
export function LayerRow({ layer, isSelected, onSelect }: LayerRowProps) {
  return <Button className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm", isSelected ? "bg-accent/15 text-accent" : "hover:bg-control")} onClick={() => onSelect(layer.element.id)} type="button"><span className="truncate">{layer.label}</span>{isSelected && <Check aria-hidden size={15} />}</Button>;
}
