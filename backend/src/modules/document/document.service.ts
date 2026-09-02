import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from '../../config';
import { HttpError } from '../../lib/http-error';
import { decryptInvoice, encryptInvoice, sha256Hex, type EncryptedBlob } from '../../services/crypto';

const documentsDir = path.join(config.dataDir, 'documents');

function documentPath(invoiceHash: string): string {
    return path.join(documentsDir, `${invoiceHash}.json`);
}

/**
 * Whitepaper mechanism/architecture: raw invoices/business terms stay encrypted off-chain;
 * only the cryptographic fingerprint (this hash) is written on-chain via
 * `SubmitReceivable(invoiceHash, ...)`. The hash is computed over the plaintext, before
 * encryption, so every institution's own encrypted copy of the same document still resolves to
 * the same on-chain fingerprint (mechanism 9: redundant off-chain evidence storage).
 *
 * Prototype-scope storage: one shared symmetric key on local disk (see services/crypto.ts).
 * Production would use per-institution keys in an HSM/KMS plus each institution's own store,
 * not one shared directory.
 */
export const documentService = {
    async storeEncrypted(plaintext: Buffer): Promise<{ invoiceHash: string }> {
        const invoiceHash = sha256Hex(plaintext);
        const blob = encryptInvoice(plaintext);
        await mkdir(documentsDir, { recursive: true });
        await writeFile(documentPath(invoiceHash), JSON.stringify(blob));
        return { invoiceHash };
    },

    async retrieveDecrypted(invoiceHash: string): Promise<Buffer> {
        let raw: string;
        try {
            raw = await readFile(documentPath(invoiceHash), 'utf8');
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
                throw new HttpError(404, `No document found for hash ${invoiceHash}`);
            }
            throw err;
        }
        return decryptInvoice(JSON.parse(raw) as EncryptedBlob);
    },
};
