export default class NodeovenClient {
  private workspaceId: string;
  private apiKey: string;
  private baseUrl: string;

  constructor(baseUrl: string, workspaceId: string, apiKey: string) {
    this.workspaceId = workspaceId;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async uploadDocument(file: File) {
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
  }
}
