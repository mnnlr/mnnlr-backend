import {Router} from 'express';

const router = Router();

import {addClient,getAllClients} from '../Controllers/ClientController.js';
import {multipleImage,singleVideo} from '../middleware/multerMiddleware.js';

router.route('/').get(getAllClients).post(multipleImage,addClient);

export default router;