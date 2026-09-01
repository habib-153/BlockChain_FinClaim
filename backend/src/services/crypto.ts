import * as crypto from 'node:crypto';
import { config } from '../config';

const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
    if (!config.invoiceEncryptionKey || config.invoiceEncryptionKey.length !== 64) {
        throw new Error(
            'INVOICE_ENCRYPTION_KEY must be set to a 64-char hex string (32 bytes). ' +
                'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
        );
    }
    return Buffer.from(config.invoiceEncryptionKey, 'hex');
}

export interface EncryptedBlob {
    iv: string;
    authTag: string;
    ciphertext: string;
}

/** Manual AES-256-GCM encryption for off-chain invoice documents. Prototype-scope key
 * management (single symmetric key from env); production would use per-institution
 * keys held in an HSM/KMS, per the whitepaper's stated production roadmap. */
export function encryptInvoice(plaintext: Buffer): EncryptedBlob {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        ciphertext: ciphertext.toString('base64'),
    };
}

export function decryptInvoice(blob: EncryptedBlob): Buffer {
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(blob.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(blob.authTag, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(blob.ciphertext, 'base64')), decipher.final()]);
}

export function sha256Hex(input: Buffer | string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Hash-based commitment binding a claim amount for dispute-time reveal: commitment =
 * SHA256(amount || nonce). Mirrors the whitepaper's Pedersen-commitment audit-trail
 * concept without requiring elliptic-curve tooling for the prototype timeline; the
 * nonce is kept off-chain (only the commitment is written to the ledger) so the
 * amount cannot be brute-forced from the commitment alone.
 */
export function commitAmount(amount: number): { commitment: string; nonce: string } {
    const nonce = crypto.randomBytes(16).toString('hex');
    const commitment = sha256Hex(`${amount}:${nonce}`);
    return { commitment, nonce };
}

export function verifyCommitment(amount: number, nonce: string, commitment: string): boolean {
    return sha256Hex(`${amount}:${nonce}`) === commitment;
}
