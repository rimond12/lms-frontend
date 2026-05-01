interface Props {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  onSuccess: () => void;
  batch: any;
}

export default function BulkEnrollmentModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return null;
}