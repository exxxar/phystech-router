import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Убедимся, что папка существует
const uploadDir = path.join(__dirname, '../../public/uploads/floors');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `floor-plan-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

export const uploadFloorPlan = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Лимит 5 МБ
}).single('plan'); // 'plan' - это имя поля в FormData с фронтенда