
import React from "react";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

export const GuestCheckInQR = () => {
  return (
    <div className="mt-6 rounded-md border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Guest Check-in QR Code</h3>
          <p className="text-sm text-muted-foreground">
            Share this QR code for quick guest check-in
          </p>
        </div>
        <Button variant="outline" size="sm">
          <QrCode className="mr-2 h-4 w-4" />
          Generate QR
        </Button>
      </div>
    </div>
  );
};
