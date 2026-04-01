import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Pipeline {
  id: string;
  label: string;
}

interface PipelineSelectorProps {
  pipelines?: Pipeline[];
  selectedPipeline?: string;
  onPipelineChange?: (pipelineId: string) => void;
  className?: string;
}

const defaultPipelines: Pipeline[] = [
  { id: "default", label: "Default pipeline" },
  { id: "sales", label: "Sales pipelines and tunnels" },
];

export function PipelineSelector({
  pipelines = defaultPipelines,
  selectedPipeline = "default",
  onPipelineChange,
  className,
}: PipelineSelectorProps) {
  const [selected, setSelected] = useState(selectedPipeline);

  const currentPipeline = pipelines.find((p) => p.id === selected) || pipelines[0];

  const handleSelect = (pipelineId: string) => {
    setSelected(pipelineId);
    onPipelineChange?.(pipelineId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "gap-2 px-3 py-2 h-auto font-medium text-primary hover:bg-primary/10",
            className
          )}
        >
          <Layers className="h-4 w-4" />
          {currentPipeline.label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-popover">
        {pipelines.map((pipeline) => (
          <DropdownMenuItem
            key={pipeline.id}
            onClick={() => handleSelect(pipeline.id)}
            className={cn(
              "cursor-pointer py-3",
              selected === pipeline.id && "bg-accent"
            )}
          >
            {pipeline.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
