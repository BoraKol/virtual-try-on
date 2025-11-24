export enum AppMode {
  EDITOR = 'EDITOR',
  VTO = 'VTO'
}

export interface GeneratedImage {
  url: string;
  timestamp: number;
}

export interface VTORequest {
  userImage: string | null; // Base64
  garmentImage: string | null; // Base64
}

export interface EditorRequest {
  sourceImage: string | null; // Base64
  prompt: string;
}
