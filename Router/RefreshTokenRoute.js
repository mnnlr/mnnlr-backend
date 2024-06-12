import express from "express";

const router = express.Router();

import {getRefreshToken} from '../Controllers/refreshTokenController.js'

router.get("/api/v1/refresh-token", getRefreshToken);


export default router;
