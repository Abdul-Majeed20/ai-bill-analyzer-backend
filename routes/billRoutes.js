import express from 'express';
const router = express.Router();
import { analayzeBillData, analyzeManualBillData, explainBill, getBillHistory } from '../controllers/billController.js';
import { upload } from '../middleware/multer.js';


router.post('/get-bill-data', upload.single("image") , analayzeBillData);
router.post('/analyze-manual', analyzeManualBillData);
router.post('/generate-explanation', explainBill);
// router.get('/explanation/:billId', explainBill); // New route to fetch explanation by bill ID
router.get('/history', getBillHistory); // New route to fetch user's bill history

export default router;
