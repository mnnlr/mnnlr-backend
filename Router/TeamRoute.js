import {Router} from 'express';

const router = Router();

import { createTeam,getTeam } from '../Controllers/teamController.js';
import { isAuthenticated } from '../middleware/auth.js';
import { restrictMiddleware } from '../middleware/restrictMiddleware.js';

router.route('/').get(isAuthenticated,restrictMiddleware(["admin","hr"]),getTeam).post(isAuthenticated,restrictMiddleware(["admin","hr"]),createTeam);

export default router;