
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { generateTicketLink } from "@/lib/mock-data";
import { toast } from "@/components/ui/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubPromoters } from "@/contexts/SubPromoterContext";

interface SubPromoterQrCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
}

export const SubPromoterQrCodeDialog = ({ 
  isOpen, 
  onOpenChange, 
  eventId 
}: SubPromoterQrCodeDialogProps) => {
  const { currentUser } = useAuth();
  const [qrValue, setQrValue] = useState("");
  const [uniqueCode, setUniqueCode] = useState("ABC123"); // Default code
  
  // Generate QR code when dialog opens
  useEffect(() => {
    if (isOpen) {
      // In a real app, we would fetch this from the database
      // For now, just generate a random code if we don't have one
      setUniqueCode(Math.random().toString(36).substring(2, 8).toUpperCase());
      
      const ticketLink = generateTicketLink(eventId || "default-event", uniqueCode);
      setQrValue(ticketLink);
    }
  }, [isOpen, eventId, uniqueCode]);
  
  const copyLink = () => {
    navigator.clipboard.writeText(qrValue);
    toast({
      title: "Link copied!",
      description: "The ticket link has been copied to your clipboard.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your Ticket Link QR Code</DialogTitle>
          <DialogDescription>
            Share this QR code with potential customers to sell tickets
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="mb-4 p-4 bg-white rounded-md">
            <QRCodeSVG
              value={qrValue}
              size={256}
              bgColor="#FFFFFF"
              fgColor="#000000"
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-center text-sm mb-2">
            Your unique code: <span className="font-bold">{uniqueCode}</span>
          </p>
          <p className="text-center text-sm">
            {qrValue}
          </p>
          <Button className="mt-4" onClick={copyLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
