import { Router } from "express";
import {
  addAudioMessage,
  addImageMessage,
  addMessage,
  deliveredMessage,
  getInitialChats,
  getMessages,
  markAllAsDelivered,
  markAllAsSeen,
  seenMessage,
} from "../controllers/MessageController.js";
import multer from "multer";

const router = Router();

const uploadImage = multer({ dest: "uploads/images" });
const uploadAudio = multer({ dest: "uploads/audios" });

router.post("/add-message", addMessage);
router.get("/get-messages/:from/:to", getMessages);
router.post("/add-image-message", uploadImage.single("image"), addImageMessage);
router.post("/add-audio-message", uploadAudio.single("audio"), addAudioMessage);
router.get("/get-initial-contacts/:userId", getInitialChats);

router.put("/seenMessage/:messageId", seenMessage);
router.put("/deliveredMessage/:messageId", deliveredMessage);

router.put("/seenAllMessage", markAllAsSeen);
router.put("/deliveredAllMessage", markAllAsDelivered);
export default router;
