import { Request, Response } from 'express';
import multer from 'multer';
import { prisma } from '../prisma';

// Use memory storage instead of disk — file stays in buffer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            return cb(null, true);
        }
        cb(new Error('Apenas arquivos de imagem são permitidos!'));
    }
}).single('banner');

export class UploadController {
    static async uploadBanner(req: Request, res: Response) {
        upload(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: 'Erro no upload: ' + err.message });
            } else if (err) {
                return res.status(400).json({ error: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }

            try {
                const record = await prisma.upload.create({
                    data: {
                        filename: req.file.originalname,
                        mimeType: req.file.mimetype,
                        data: req.file.buffer,
                    }
                });

                const fileUrl = `/api/uploads/${record.id}`;
                res.json({ url: fileUrl });
            } catch (dbErr: any) {
                console.error('[Upload] Erro ao salvar no banco:', dbErr);
                res.status(500).json({ error: 'Erro ao salvar imagem no banco de dados' });
            }
        });
    }

    static async serveImage(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const record = await prisma.upload.findUnique({ where: { id } });

            if (!record) {
                return res.status(404).json({ error: 'Imagem não encontrada' });
            }

            res.set('Content-Type', record.mimeType);
            res.set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year cache
            res.send(record.data);
        } catch (err) {
            console.error('[Upload] Erro ao servir imagem:', err);
            res.status(500).json({ error: 'Erro ao buscar imagem' });
        }
    }
}
