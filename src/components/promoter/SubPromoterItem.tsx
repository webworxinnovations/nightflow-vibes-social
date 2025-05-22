
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, QrCode } from "lucide-react";
import { SubPromoter, generateTicketLink } from "@/lib/mock-data";
import { toast } from "@/components/ui/use-toast";

interface SubPromoterItemProps {
  promoter: SubPromoter;
  eventId: string;
  onShowQrCode: (promoter: SubPromoter) => void;
}

export const SubPromoterItem = ({ promoter, eventId, onShowQrCode }: SubPromoterItemProps) => {
  const copyLink = () => {
    const link = generateTicketLink(eventId, promoter.uniqueCode);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "The ticket link has been copied to your clipboard.",
    });
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={promoter.avatar} alt={promoter.name} />
            <AvatarFallback>{promoter.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div>{promoter.name}</div>
            <div className="text-xs text-muted-foreground">{promoter.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{promoter.uniqueCode}</Badge>
      </TableCell>
      <TableCell className="text-right">{promoter.ticketsSold}</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={copyLink}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onShowQrCode(promoter)}>
          <QrCode className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
