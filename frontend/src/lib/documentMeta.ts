export interface DocumentMeta {
  subject: string;
  tags: string[];
}

const STORAGE_KEY = "droussi_document_meta";

function readAll(): Record<string, DocumentMeta> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DocumentMeta>) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, DocumentMeta>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getDocumentMeta(docId: string): DocumentMeta | null {
  return readAll()[docId] ?? null;
}

export function setDocumentMeta(docId: string, meta: DocumentMeta) {
  const all = readAll();
  all[docId] = meta;
  writeAll(all);
}

export function removeDocumentMeta(docId: string) {
  const all = readAll();
  delete all[docId];
  writeAll(all);
}

export function getDocumentMetaOrDefault(
  docId: string,
  fallback: DocumentMeta = { subject: "General", tags: [] }
): DocumentMeta {
  return getDocumentMeta(docId) ?? fallback;
}
