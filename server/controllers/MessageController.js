import getPrismaInstance from "../utils/PrismaClient.js";
import { renameSync } from "fs";

export const addMessage = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { message, from, to } = req.body;

    const getUser = onlineUsers.get(to);

    if (message && from && to) {
      const newMessage = await prisma.messages.create({
        data: {
          message,
          sender: {
            connect: {
              id: from,
            },
          },
          receiver: {
            connect: {
              id: to,
            },
          },
          messageStatus: getUser ? "delivered" : "sent",
        },
        include: {
          sender: true,
          receiver: true,
        },
      });
      res.status(201).json({
        message: newMessage,
      });
    } else {
      return res.status(400).send("From, To and Message are required");
    }
  } catch (e) {
    next(e);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { from, to } = req.params;

    if (from && to) {
      const messages = await prisma.messages.findMany({
        where: {
          OR: [
            {
              senderId: from,
              receiverId: to,
            },
            {
              senderId: to,
              receiverId: from,
            },
          ],
        },
        include: {
          sender: true,
          receiver: true,
        },
        orderBy: {
          id: "asc",
        },
      });

      const unreadMessages = [];
      messages.forEach((message, index) => {
        if (message.messageStatus !== "read" && message.senderId === to) {
          messages[index].messageStatus = "read";
          unreadMessages.push(message.id);
        }
      });

      await prisma.messages.updateMany({
        where: {
          id: {
            in: unreadMessages,
          },
        },
        data: {
          messageStatus: "read",
        },
      });

      return res.status(200).json({
        messages,
      });
    }

    return res.status(400).send("From and To are required");
  } catch (e) {
    next(e);
  }
};

export const addImageMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = new Date().getMinutes();
      const fileName = `uploads/images/${date}-${req.file.originalname}`;
      renameSync(req.file.path, fileName);
      const prisma = getPrismaInstance();
      const { from, to } = req.query;

      if (from && to) {
        const message = await prisma.messages.create({
          data: {
            message: fileName,
            type: "image",
            sender: {
              connect: {
                id: from,
              },
            },
            receiver: {
              connect: {
                id: to,
              },
            },
          },
        });

        return res.status(201).json({
          message,
        });
      } else {
        return res.status(400).send("From and To are required");
      }
    }
    return res.status(400).send("Image is required");
  } catch (e) {
    next(e);
  }
};
export const addAudioMessage = async (req, res, next) => {
  try {
    if (req.file) {
     const uniqueNumber = Date.now() + Math.floor(Math.random() * 100000);
     const fileName = `uploads/audios/${uniqueNumber}-${req.file.originalname}`;
     renameSync(req.file.path, fileName);
     const prisma = getPrismaInstance();
     const { from, to } = req.query;
     console.log({ fileName });


      if (from && to) {
        const message = await prisma.messages.create({
          data: {
            message: fileName,
            type: "audio",
            sender: {
              connect: {
                id: from,
              },
            },
            receiver: {
              connect: {
                id: to,
              },
            },
          },
        });

        return res.status(201).json({
          message,
        });
      } else {
        return res.status(400).send("From and To are required");
      }
    }
    return res.status(400).send("Audio is required");
  } catch (e) {
    next(e);
  }
};

export const getInitialChats = async (req, res, next) => {
  try {
    let { userId } = req.params;
    userId = userId;

    const prisma = getPrismaInstance();

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        sentMessages: {
          include: {
            sender: true,
            receiver: true,
          },
          orderBy: {
            id: "desc",
          },
        },
        receivedMessages: {
          include: {
            sender: true,
            receiver: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const messages = [...user.sentMessages, ...user.receivedMessages];
    messages.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const users = new Map();
    const messageStatusChange = [];

    messages.forEach((msg) => {
      const iSender = msg.senderId === userId;
      const calculatedId = iSender ? msg.receiverId : msg.senderId;
      if (msg.messageStatus === "sent" && !iSender) {
        messageStatusChange.push(msg.id);
      }
      const {
        id,
        type,
        message,
        messageStatus,
        createdAt,
        senderId,
        receiverId,
      } = msg;
      if (!users.get(calculatedId)) {
        let user = {
          messageId: id,
          type,
          message,
          messageStatus,
          createdAt,
          senderId,
          receiverId,
        };

        if (iSender) {
          user = {
            ...user,
            ...msg.receiver,
            totalUnreadMessages: 0,
          };
          console.log("iSender block");
        } else {
          user = {
            ...user,
            ...msg.sender,
            totalUnreadMessages: messageStatus !== "seen" || "read" ? 0 : 0,
          };
        }
        console.log("iSender 2nd block");
        users.set(calculatedId, { ...user });
        ///msg.messageStatus !=="seen" ||"read" && !iSender)
      } else if (msg.messageStatus === ("seen" || "read") && !iSender) {
        const user = users.get(calculatedId, { messageStatus: "delivered" });
        console.log("xxxxxxxxxxxxxxxxx", user);
        users.set(calculatedId, {
          ...user,
          totalUnreadMessages:
            msg.messageStatus === "delivered"
              ? user.totalUnreadMessages
              : user.totalUnreadMessages,
          // totalUnreadMessages: msg.messageStatus === "delivered"?user.totalUnreadMessages+1:0,
          //user.totalUnreadMessages + 1
        });
      }
    });

    if (messageStatusChange.length > 0) {
      await prisma.messages.updateMany({
        where: {
          id: {
            in: messageStatusChange,
          },
        },
        data: {
          messageStatus: "delivered",
        },
      });
    }

    const usersArray = Array.from(users.values()).filter(
      (user) => user.id !== userId,
    );
    return res.status(200).json({
      users: usersArray,
      onlineUsers: Array.from(onlineUsers.keys()).filter(
        (user) => user !== userId,
      ),
    });
  } catch (e) {
    next(e);
  }
};
//seen message status

export const seenMessage = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).send("MessageId is required");
    }

    const message = await prisma.messages.update({
      where: { id: messageId },
      data: { messageStatus: "seen" },
    });
    // console.log("sseen", message);

    return res.status(200).json({
      message,
    });
  } catch (error) {
    next(error);
  }
};
//delivered message

export const deliveredMessage = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).send("MessageId is required");
    }

    const message = await prisma.messages.update({
      where: { id: messageId },
      data: { messageStatus: "delivered" },
    });

    return res.status(200).json({
      message,
    });
  } catch (error) {
    next(error);
  }
};

// Mark all messages as seen
export const markAllAsSeen = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    await prisma.messages.updateMany({
      // where: { messageStatus: "delivered" },
      data: { messageStatus: "seen" },
    });

    return res.status(200).json({
      message: "All messages marked as seen",
    });
  } catch (error) {
    next(error);
  }
};

// Mark all messages as delivered
export const markAllAsDelivered = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    await prisma.messages.updateMany({
      // where: { messageStatus: "seen" },
      data: { messageStatus: "delivered" },
    });

    return res.status(200).json({
      message: "All messages marked as delivered",
    });
  } catch (error) {
    next(error);
  }
};
