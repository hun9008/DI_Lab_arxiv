"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface GroupDownloadButtonProps {
  groupId: number
}

export function GroupDownloadButton({ groupId }: GroupDownloadButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild type="button" variant="outline">
          <a href={`/api/paper-groups/${groupId}/download`}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Download as CSV.</TooltipContent>
    </Tooltip>
  )
}
