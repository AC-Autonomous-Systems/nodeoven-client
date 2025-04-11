export type NodeovenDocument = {
  id: string;
  filename: string;
  type: 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'csv' | 'txt' | string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  manualReviewed: boolean;
  isProcessing: boolean;
  documentContent: string | null;
  reviewedContent: string | null;
  sourceLocations?:
    | {
        content: string;
        xmin: number;
        ymin: number;
        xmax: number;
        ymax: number;
      }[]
    | null;
};
