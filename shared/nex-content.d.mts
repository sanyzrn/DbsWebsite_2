export type ContentNode = { type: string; value?: string; children?: ContentNode[]; url?: string; alt?: string; depth?: number; ordered?: boolean; start?: number };
export type GuideSection = { id: string; title: string; blocks: ContentNode[]; text: string };
export function safeContentUrl(value: unknown): string | null;
export function parseMarkdown(value: string): ContentNode[];
export function contentText(nodes: ContentNode[]): string;
export function parseGuide(value: string): { intro: ContentNode[]; sections: GuideSection[] };
export function parseChangelog(value: string): Map<string, ContentNode[]>;
export type NexTheme = { id: string; name: {fa:string;en:string}; description:{fa:string;en:string}; seed:string;light:string|null;dark:string|null;texture:string };
export function parseThemePresets(value: string): NexTheme[];
