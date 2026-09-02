import type { Request, Response } from 'express';
import { documentService } from './document.service';
import { parseUploadDocumentDto } from './dto/upload-document.dto';

export const documentController = {
    async upload(req: Request, res: Response): Promise<void> {
        const dto = parseUploadDocumentDto(req.body);
        const plaintext = Buffer.from(dto.contentBase64, 'base64');
        res.status(201).json(await documentService.storeEncrypted(plaintext));
    },

    async download(req: Request, res: Response): Promise<void> {
        const plaintext = await documentService.retrieveDecrypted(req.params.hash);
        res.status(200).json({ contentBase64: plaintext.toString('base64') });
    },
};
