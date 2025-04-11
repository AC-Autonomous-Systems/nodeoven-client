// See https://github.com/AC-Autonomous-Systems/nodeoven-client/blob/master/index.ts

import { FILETYPES, NodeovenDocument } from './document-types';
import {
  CreateWorkflowRunOutput,
  CreateWorkflowRunSuccessOutput,
  GetWorkflowRunByIdSuccessfulResponse,
  Workflow,
  WorkflowRun,
  zRunWorkflowInput,
} from './workflow-types';
import { z } from 'zod';

export default class NodeovenClient {
  private workspaceId: string;
  private apiKey: string;
  private baseUrl: string;

  constructor(baseUrl: string, workspaceId: string, apiKey: string) {
    this.workspaceId = workspaceId; // In the actual API, this is called tenantId. Need to refactor.
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /* -------------------------------- Documents ------------------------------- */
  async uploadDocument(
    file: Blob,
    filename: string,
    fileType: (typeof FILETYPES)[number],
    isSynchronous: boolean,
    folderId?: string
  ): Promise<NodeovenDocument> {
    const formData = new FormData();
    formData.append('file', file);

    // Validate the file name:
    formData.append('filename', filename);
    formData.append('fileType', fileType);

    formData.append('tenantId', this.workspaceId);
    if (folderId) {
      formData.append('folderId', folderId);
    }
    formData.append('isSynchronous', isSynchronous.toString());

    const response = await fetch(this.baseUrl + '/api/documents/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.error);
      } catch (error) {
        throw new Error('Failed to upload file, error: ' + error);
      }
    }

    const responseBody = await response.json();
    if (!responseBody.document) {
      throw new Error('Document not found.');
    }
    return responseBody.document;
  }
  async getDocumentById(documentId: string): Promise<NodeovenDocument> {
    const response = await fetch(
      `${this.baseUrl}/api/documents/${documentId}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.error);
      } catch (error) {
        throw new Error('Failed to get document, error: ' + error);
      }
    }
    const responseBody = await response.json();
    if (!responseBody.document) {
      throw new Error('Document not found.');
    }
    return responseBody.document;
  }

  /* -------------------------------- Workflows ------------------------------- */
  async getWorkflowRunById(
    workflowId: string,
    workflowRunId: string
  ): Promise<GetWorkflowRunByIdSuccessfulResponse> {
    console.log(
      'Request address: ',
      `${this.baseUrl}/api/workflows/${workflowId}/run/${workflowRunId}`
    );
    const response = await fetch(
      `${this.baseUrl}/api/workflows/${workflowId}/run/${workflowRunId}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
        },
        cache: 'no-cache',
      }
    );
    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.error);
      } catch (error) {
        throw new Error('Failed to get workflow, error: ' + error);
      }
    }
    const responseBody = await response.json();
    if (!responseBody) {
      throw new Error('Workflow not found.');
    }

    return responseBody as GetWorkflowRunByIdSuccessfulResponse;
  }

  async runWorkflow(
    workflowId: string,
    runWOrkflowInput: z.infer<typeof zRunWorkflowInput>
  ): Promise<CreateWorkflowRunSuccessOutput> {
    const response = await fetch(
      `${this.baseUrl}/api/workflows/${workflowId}/run`,
      {
        method: 'POST',
        body: JSON.stringify(runWOrkflowInput),
        headers: {
          'x-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.error);
      } catch (error) {
        throw new Error('Failed to run workflow, error: ' + error);
      }
    }

    const responseBody = await response.json();
    return responseBody as CreateWorkflowRunSuccessOutput;
  }
}
