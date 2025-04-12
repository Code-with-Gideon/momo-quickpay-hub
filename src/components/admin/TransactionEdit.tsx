
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TransactionEditProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editAmount: string;
  setEditAmount: (value: string) => void;
  editRecipient: string;
  setEditRecipient: (value: string) => void;
  editDescription: string;
  setEditDescription: (value: string) => void;
  editStatus: string;
  setEditStatus: (value: string) => void;
  onSave: () => void;
}

const TransactionEdit: React.FC<TransactionEditProps> = ({
  isOpen,
  onOpenChange,
  editAmount,
  setEditAmount,
  editRecipient,
  setEditRecipient,
  editDescription,
  setEditDescription,
  editStatus,
  setEditStatus,
  onSave
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="amount" className="text-right text-sm">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="col-span-3"
              min="100"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="recipient" className="text-right text-sm">
              Recipient
            </label>
            <Input
              id="recipient"
              value={editRecipient}
              onChange={(e) => setEditRecipient(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right text-sm">
              Description
            </label>
            <Input
              id="description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="status" className="text-right text-sm">
              Status
            </label>
            <select
              id="status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#070058] focus:border-transparent"
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionEdit;
