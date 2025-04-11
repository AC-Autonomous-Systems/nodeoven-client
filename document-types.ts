import { SourceLocation } from './workflow-types';
import { z } from 'zod';
export const FILETYPES = [
  'pdf',
  'docx',
  'pptx',
  'xlsx',
  'xls',
  'csv',
  'txt',
  'jpeg',
  'jpg',
  'png',
  'mixed',
] as const;

export const DOCUMENT_PERMISSIONS = ['owner', 'editor', 'viewer'] as const;

export const FILE_ADAPTERS = ['s3'] as const;

export const FILE_ADAPTER_PAGE_TYPES = [
  'image',
  'pdf',
  'docx',
  'pptx',
  'xlsx',
  'csv',
  'txt',
] as const;
export const PRESIGNED_DOCUMENT_PERMISSIONS = ['editor', 'viewer'] as const;

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
export type DocumentPage = {
  page: number;
  id: string;
  manualReviewed: boolean;
  reviewedContent: string | null;
  documentId: string;
  content: string | null;
  sourceLocations?:
    | {
        content: string;
        xmin: number;
        ymin: number;
        xmax: number;
        ymax: number;
      }[]
    | null;
  embeddings: number[] | null;
  pageFileAdapterUsed: string | null;
  pageFilePath: string | null;
  pageStoredType: string | null;
};

export type DocumentPermission = {
  id: string;
  documentId: string;
  userId: string;
  permission: (typeof DOCUMENT_PERMISSIONS)[number];
};

export type DocumentPresignedAccessKey = {
  id: string;
  documentId: string;
  identifier: string;
  createdAt: Date;
  expiresAt: Date;
  permission: (typeof PRESIGNED_DOCUMENT_PERMISSIONS)[number];
  key: string;
};
/* -------------------------------------------------------------------------- */
/*                                 Input Types                                */
/* -------------------------------------------------------------------------- */
export const zCreateDocumentInput = z.object({
  filename: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long' }),
  type: z.enum(FILETYPES),
  tenantId: z.string().uuid(),
  folderId: z.string().uuid().optional(),
});

export const zUpdateDocumentPageInput = z.object({
  reviewedContent: z.string(),
});

export const zUpdateDocumentInput = z
  .object({
    filename: z
      .string()
      .min(1, { message: 'Name must be at least 1 character long' })
      .optional(),
    manualReviewed: z.boolean().optional(),
    folderId: z.string().uuid().optional(),
  })
  .refine(
    (data) =>
      data.filename !== undefined ||
      data.manualReviewed !== undefined ||
      data.folderId !== undefined,
    {
      message: 'You must specify a field to update.',
    }
  );

export const zCreateDocumentPresignedURLInput = z.object({
  expiresInDays: z
    .number()
    .min(1, { message: 'Expires in days must be at least 1' }),
  permissionLevel: z.enum(PRESIGNED_DOCUMENT_PERMISSIONS),
});

export const zShareDocumentByEmailInput = z.object({
  email: z.string().email(),
  permissionLevel: z.enum(PRESIGNED_DOCUMENT_PERMISSIONS),
});
/* -------------------------------------------------------------------------- */
/*                                API Responses                               */
/* -------------------------------------------------------------------------- */
export type UploadDocumentSuccessfulResponse = {
  document: NodeovenDocument;
};

export type UploadDocumentResponse =
  | {
      error: string;
    }
  | UploadDocumentSuccessfulResponse;

export type GetDocumentByIdSuccessfulResponse = {
  document: NodeovenDocument;
  documentPageIdsByDocumentId: {
    id: string;
    page: number;
  }[];
  permissionLevel: string;
  documentFolderId: string | null;
};

export type GetDocumentByIdResponse =
  | GetDocumentByIdSuccessfulResponse
  | {
      error: string;
    };

export type GetDocumentPageByIdSuccessfulResponse = {
  documentPage: {
    id: string;
    documentId: string;
    page: number;
    manualReviewed: boolean;
    content: string | null;
    reviewedContent: string | null;
    pageStoredType?: (typeof FILE_ADAPTER_PAGE_TYPES)[number] | null;
    documentImageURL?: string;
  };
};

export type GetDocumentPageByIdResponse =
  | GetDocumentPageByIdSuccessfulResponse
  | {
      error: string;
    };

export type GetDocumentByPresignedTokenSuccessfulResponse = {
  expiresAt: Date;
  permission: string;
};
export type GetDocumentByPresignedTokenResponse =
  | GetDocumentByPresignedTokenSuccessfulResponse
  | {
      error: string;
    };

export type CreateDocumentPresignedURLSuccessOutput = {
  key: string;
  expiresAt: Date;
};

export type CreateDocumentPresignedURLOutput =
  | CreateDocumentPresignedURLSuccessOutput
  | { error: string };

export type ShareDocumentByEmailSuccessOutput =
  | {
      documentPermission: DocumentPermission;
    }
  | {
      presignedKey: DocumentPresignedAccessKey;
    };

export type GetDocumentSharingInformationSuccessfulResponse = {
  documentPermissions: (DocumentPermission & {
    name: string | null;
    email: string | null;
  })[];
  presignedKeys: DocumentPresignedAccessKey[];
};
/* -------------------------------------------------------------------------- */
/*                                  OCR Types                                 */
/* -------------------------------------------------------------------------- */
export type PDFOCRPageAndContent = {
  page: number;
  content: string;
  sourceLocations?: SourceLocation[];
  image: Buffer;
  embeddings: number[];
};
export type PDFTextExtractionOCRConversionOutput = {
  fileTextFromOCR: string;
  sourceLocations: SourceLocation[];
  pageAndContentFromOCR: PDFOCRPageAndContent[];
  fileTextFromPDFJs?: string;
};
