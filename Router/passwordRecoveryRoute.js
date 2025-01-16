import {Router} from 'express'

const router = Router()

import { sendLink,ResetPassword } from '../Controllers/passwordRecoveryController.js'

router.route('/send-link').post(sendLink)
router.route('/reset-password/:recovery_id').post(ResetPassword)

export default router;