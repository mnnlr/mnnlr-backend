import { Router } from "express";
import {
  createNewClient,
  getAllClients,
  deleteClient,
} from "../Controllers/clientCont.js";

const router = Router();

router.post("/client/new", createNewClient);
router.get("/clients", getAllClients);
router.delete("/client/:id", deleteClient);

export default router;
