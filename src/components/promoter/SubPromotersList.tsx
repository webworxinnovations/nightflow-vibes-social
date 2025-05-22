
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { SubPromoter } from "@/lib/mock-data";
import { useSubPromoters } from "@/contexts/SubPromoterContext";
import { SubPromoterItem } from "./SubPromoterItem";
import { QrCodeDialog } from "./QrCodeDialog";
import { AddSubPromoterDialog } from "./AddSubPromoterDialog";

interface SubPromotersListProps {
  subPromoters: SubPromoter[];
  eventId: string;
}

export const SubPromotersList = ({ subPromoters, eventId }: SubPromotersListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [selectedPromoter, setSelectedPromoter] = useState<SubPromoter | null>(null);

  const showQrCode = (subPromoter: SubPromoter) => {
    setSelectedPromoter(subPromoter);
    setIsQrDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Sub-Promoters</h3>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Sub-Promoter
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="text-right">Tickets Sold</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subPromoters.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No sub-promoters yet. Add your first one!
              </TableCell>
            </TableRow>
          ) : (
            subPromoters.map((promoter) => (
              <SubPromoterItem
                key={promoter.id}
                promoter={promoter}
                eventId={eventId}
                onShowQrCode={showQrCode}
              />
            ))
          )}
        </TableBody>
      </Table>

      {/* Add Sub-Promoter Dialog */}
      <AddSubPromoterDialog 
        isOpen={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />

      {/* QR Code Dialog */}
      <QrCodeDialog 
        isOpen={isQrDialogOpen} 
        onOpenChange={setIsQrDialogOpen}
        selectedPromoter={selectedPromoter}
        eventId={eventId}
      />
    </>
  );
};
