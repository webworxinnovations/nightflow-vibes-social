
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const GuestCheckInQR = () => {
  const [showQrDialog, setShowQrDialog] = useState(false);

  return (
    <div className="mt-6 rounded-md border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Guest Check-in QR Code</h3>
          <p className="text-sm text-muted-foreground">
            Share this QR code for quick guest check-in
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowQrDialog(true)}>
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
            <div className="h-64 w-64 bg-white p-4">
              <div className="flex h-full items-center justify-center bg-black/10 text-center text-sm text-gray-500">
                QR code placeholder<br />
                (SDK integration needed)
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Share this QR code with your staff to scan guest tickets at the venue entrance
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
