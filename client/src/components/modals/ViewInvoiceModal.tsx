import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Invoice {
  id: string;
  project: string;
  client: string;
  amount: number;
  status: string;
  dueDate: string;
  sentDate: string;
  paymentMethod: string;
}

interface ViewInvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewInvoiceModal = ({ invoice, isOpen, onClose }: ViewInvoiceModalProps) => {
  if (!invoice) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500';
      case 'Pending':
        return 'bg-yellow-500';
      case 'Overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const DetailRow = ({ label, value, badge = false }: { label: string; value: string | number; badge?: boolean }) => (
    <div className="flex flex-col space-y-1 py-3 border-b last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      {badge ? (
        <Badge className={getStatusColor(value as string)}>
          {value}
        </Badge>
      ) : (
        <span className="font-medium">
          {typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}
        </span>
      )}
    </div>
  );

    return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice Details</span>
            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {invoice.id}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 pb-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Project Information</h3>
              <DetailRow label="Project Name" value={invoice.project} />
              <DetailRow label="Client" value={invoice.client} />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Payment Details</h3>
              <DetailRow label="Amount" value={invoice.amount} />
              <DetailRow label="Status" value={invoice.status} badge />
              <DetailRow label="Payment Method" value={invoice.paymentMethod} />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Dates</h3>
              <DetailRow label="Due Date" value={invoice.dueDate} />
              <DetailRow label="Sent Date" value={invoice.sentDate} />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-2">
          <Button className='w-full' onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewInvoiceModal; 