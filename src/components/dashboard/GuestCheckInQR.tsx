
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "@/components/ui/use-toast";

export const GuestCheckInQR = () => {
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [qrValue, setQrValue] = useState("");

  const handleGenerateQR = () => {
    // In a real app, this would be a unique check-in URL
    const checkInUrl = `https://nightflow.app/check-in/${Date.now()}`;
    setQrValue(checkInUrl);
    setShowQrDialog(true);
    toast({
      title: "QR Code Generated",
      description: "Your check-in QR code has been generated successfully."
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrValue);
    toast({
      title: "Link Copied",
      description: "Check-in link copied to clipboard."
    });
  };

  return (
    <div className="mt-6 rounded-md border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Guest Check-in QR Code</h3>
          <p className="text-sm text-muted-foreground">
            Share this QR code for quick guest check-in
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleGenerateQR}>
          <QrCode className="mr-2 h-4 w-4" />
          Generate QR
        </Button>
      </div>
      
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-in QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <div className="h-64 w-64 bg-white p-4 rounded-md">
              {qrValue ? (
                <QRCodeSVG
                  value={qrValue}
                  size={224}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="H"
                  includeMargin={false}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-black/10 text-center text-sm text-gray-500">
                  Generating QR code...
                </div>
              )}
            </div>
            <p className="mt-4 text-sm text-center">{qrValue}</p>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Share this QR code with your staff to scan guest tickets at the venue entrance
            </p>
            <Button className="mt-4" onClick={handleCopyLink}>
              Copy Check-in Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
