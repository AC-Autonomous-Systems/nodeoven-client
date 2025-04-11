// See https://github.com/AC-Autonomous-Systems/nodeoven-client/blob/master/index.ts

import { NodeovenDocument } from './document-types';
import { CreateWorkflowRunOutput, zRunWorkflowInput } from './workflow-types';
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

  async uploadDocument(
    file: File,
    folderId: string
  ): Promise<NodeovenDocument | Error> {
    const formData = new FormData();
    formData.append('file', file);

    // Validate the file name:
    const filenameSplit = file.name.split('.');
    if (filenameSplit.length < 2) {
      throw new Error(
        `Invalid file name, the filename does not have an extension.`
      );
    }
    formData.append('filename', filenameSplit.slice(0, -1).join('.'));
    formData.append(
      'fileType',
      filenameSplit[filenameSplit.length - 1].toLowerCase()
    );

    formData.append('tenantId', this.workspaceId);
    formData.append('folderId', folderId);

    const response = await fetch('/api/documents/upload', {
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
    return responseBody;
  }

  async runWorkflow(
    runWOrkflowInput: z.infer<typeof zRunWorkflowInput>
  ): Promise<CreateWorkflowRunOutput> {
    const response = await fetch('/api/workflows/run', {
      method: 'POST',
      body: JSON.stringify(runWOrkflowInput),
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.error);
      } catch (error) {
        throw new Error('Failed to run workflow, error: ' + error);
      }
    }

    const responseBody = await response.json();
    return responseBody;
  }
}
