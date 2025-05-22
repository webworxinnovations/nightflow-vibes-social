
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { SubPromoter, generateTicketLink } from "@/lib/mock-data";
import { toast } from "@/components/ui/use-toast";
import { QRCodeSVG } from "qrcode.react";

interface QrCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPromoter: SubPromoter | null;
  eventId: string;
}

export const QrCodeDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedPromoter, 
  eventId 
}: QrCodeDialogProps) => {
  const copyLink = () => {
    if (!selectedPromoter) return;
    
    const link = generateTicketLink(eventId, selectedPromoter.uniqueCode);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "The ticket link has been copied to your clipboard.",
    });
  };

  const getTicketLink = () => {
    if (!selectedPromoter) return "";
    return generateTicketLink(eventId, selectedPromoter.uniqueCode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ticket Link QR Code</DialogTitle>
          <DialogDescription>
            Share this QR code with your sub-promoter
          </DialogDescription>
        </DialogHeader>
        {selectedPromoter && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="mb-4 p-4 bg-white rounded-md">
              <QRCodeSVG
                value={getTicketLink()}
                size={256}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-center text-sm">
              {getTicketLink()}
            </p>
            <Button className="mt-4" onClick={copyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
