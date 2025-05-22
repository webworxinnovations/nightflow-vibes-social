
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, UserPlus, QrCode } from "lucide-react";
import { SubPromoter, generateTicketLink } from "@/lib/mock-data";
import { toast } from "@/components/ui/use-toast";

interface SubPromotersListProps {
  subPromoters: SubPromoter[];
  eventId: string;
}

export const SubPromotersList = ({ subPromoters, eventId }: SubPromotersListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [selectedPromoter, setSelectedPromoter] = useState<SubPromoter | null>(null);
  const [newPromoter, setNewPromoter] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const copyLink = (subPromoter: SubPromoter) => {
    const link = generateTicketLink(eventId, subPromoter.uniqueCode);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "The ticket link has been copied to your clipboard.",
    });
  };

  const showQrCode = (subPromoter: SubPromoter) => {
    setSelectedPromoter(subPromoter);
    setIsQrDialogOpen(true);
  };

  const addSubPromoter = () => {
    // In a real app, we would save to the database
    toast({
      title: "Sub-promoter added",
      description: `${newPromoter.name} has been added as a sub-promoter.`,
    });
    setNewPromoter({ name: "", email: "", phone: "" });
    setIsAddDialogOpen(false);
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
          {subPromoters.map((promoter) => (
            <TableRow key={promoter.id}>
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
                <Button variant="ghost" size="sm" onClick={() => copyLink(promoter)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => showQrCode(promoter)}>
                  <QrCode className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Sub-Promoter Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sub-Promoter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                value={newPromoter.name}
                onChange={(e) => setNewPromoter({...newPromoter, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                value={newPromoter.email}
                onChange={(e) => setNewPromoter({...newPromoter, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone (optional)</label>
              <Input
                id="phone"
                value={newPromoter.phone}
                onChange={(e) => setNewPromoter({...newPromoter, phone: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={addSubPromoter}>Add Sub-Promoter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ticket Link QR Code</DialogTitle>
          </DialogHeader>
          {selectedPromoter && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="mb-4 p-4 bg-white rounded-md">
                {/* In a real implementation, this would be an actual QR code */}
                <div className="w-64 h-64 grid grid-cols-8 grid-rows-8 gap-1">
                  {Array(64).fill(0).map((_, i) => (
                    <div 
                      key={i} 
                      className={`
                        ${Math.random() > 0.7 ? "bg-black" : "bg-transparent"}
                        ${(i < 8 || i >= 56 || i % 8 === 0 || i % 8 === 7) ? "bg-black" : ""}
                      `}
                    />
                  ))}
                </div>
              </div>
              <p className="text-center text-sm">
                {generateTicketLink(eventId, selectedPromoter.uniqueCode)}
              </p>
              <Button className="mt-4" onClick={() => copyLink(selectedPromoter)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
