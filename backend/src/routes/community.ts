import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";

const router = Router();

// Messages for one channel, oldest first. Channels are a fixed, code-defined
// list on the frontend (not a DB table) — any non-empty channelId is
// accepted here, it just won't have any messages if it isn't a real one.
router.get("/messages", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const channelId = typeof req.query.channelId === "string" ? req.query.channelId : "";
  if (!channelId) {
    return res.status(400).json({ error: "channelId is required." });
  }

  const messages = await prisma.communityMessage.findMany({
    where: { channelId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, role: true } } },
    take: 200
  });

  return res.json({
    messages: messages.map((m) => ({
      id: m.id,
      channelId: m.channelId,
      senderName: m.user.name,
      senderRole: m.user.role,
      content: m.content,
      codeSnippet: m.codeSnippet,
      likes: m.likes,
      createdAt: m.createdAt
    }))
  });
});

// Posting requires a real session — there is no anonymous/fallback name path,
// which is what makes this a structural fix for the old local-state bug that
// misattributed anonymous posts to a real seeded student's name.
router.post("/messages", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const body = req.body ?? {};
  const channelId = typeof body.channelId === "string" ? body.channelId.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const codeSnippet = typeof body.codeSnippet === "string" && body.codeSnippet.trim() ? body.codeSnippet : null;

  if (!channelId || (!content && !codeSnippet)) {
    return res.status(400).json({ error: "channelId and content (or a code snippet) are required." });
  }
  if (content.length > 4000) {
    return res.status(400).json({ error: "Message is too long (4000 characters max)." });
  }
  if (codeSnippet && codeSnippet.length > 8000) {
    return res.status(400).json({ error: "Code snippet is too long (8000 characters max)." });
  }

  const message = await prisma.communityMessage.create({
    data: { channelId, userId: session.id, content, codeSnippet },
    include: { user: { select: { name: true, role: true } } }
  });

  return res.json({
    message: {
      id: message.id,
      channelId: message.channelId,
      senderName: message.user.name,
      senderRole: message.user.role,
      content: message.content,
      codeSnippet: message.codeSnippet,
      likes: message.likes,
      createdAt: message.createdAt
    }
  });
});

// One like per (user, message) — enforced by the CommunityMessageLike
// unique constraint, not just a bare counter increment, which used to let a
// single user inflate any message's count arbitrarily by re-calling this.
router.post("/messages/:id/like", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const messageId = req.params.id;
  const message = await prisma.communityMessage.findUnique({ where: { id: messageId }, select: { likes: true } });
  if (!message) {
    return res.status(404).json({ error: "Message not found." });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.communityMessageLike.create({ data: { messageId, userId: session.id } });
      return tx.communityMessage.update({ where: { id: messageId }, data: { likes: { increment: 1 } } });
    });
    return res.json({ likes: updated.likes, alreadyLiked: false });
  } catch {
    // Unique-constraint hit -> this user already liked it; return the
    // current count unchanged instead of erroring on a double-click.
    return res.json({ likes: message.likes, alreadyLiked: true });
  }
});

export default router;
