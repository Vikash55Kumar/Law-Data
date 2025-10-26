import { Router } from 'express';

import { registerLaw, getAllLaws } from '../controllers/law.controller';
import { upload } from '../middlewares/multer';

const router = Router();

// Route to register a law document (with file upload)
router.route("/register-law").post(upload.fields([{ name: "file", maxCount: 1 }]), registerLaw);
// Route to get all laws
router.route("/get-all-laws").get(getAllLaws);

export default router;