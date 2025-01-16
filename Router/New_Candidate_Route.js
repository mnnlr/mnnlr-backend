import {Router} from 'express';

const router = Router();

import {getAllNewCandidates,ApplyCandidacy,getNewCandidateById,updateCandidateById} from '../Controllers/NewCandidateController.js';
import { isAuthenticated } from '../middleware/auth.js';
import { restrictMiddleware } from '../middleware/restrictMiddleware.js';

router.route('/')
    .get(isAuthenticated,restrictMiddleware(["admin","hr"]),getAllNewCandidates)
    .post(ApplyCandidacy);
    
router.route('/:id')
    .get(isAuthenticated,restrictMiddleware(["admin","hr"]),getNewCandidateById)
    .patch(isAuthenticated,restrictMiddleware(["admin","hr"]),updateCandidateById);

export default router;