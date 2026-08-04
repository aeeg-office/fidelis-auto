import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

// ─── GET /api/messages — List conversations for current user ─────────────
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participant1Id: user.id }, { participant2Id: user.id }],
    },
    include: {
      participant1: { select: { id: true, name: true } },
      participant2: { select: { id: true, name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, read: true, senderId: true },
      },
    },
    orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
  });

  const result = conversations.map((c) => {
    const otherUser =
      c.participant1Id === user.id ? c.participant2 : c.participant1;

    const lastMessage = c.messages[0] ?? null;

    // Count unread messages in this conversation for the current user
    const unread =
      lastMessage && !lastMessage.read && lastMessage.senderId !== user.id
        ? 1
        : 0;

    return {
      id: c.id,
      otherUser,
      lastMessage: lastMessage
        ? { content: lastMessage.content, createdAt: lastMessage.createdAt }
        : null,
      unreadCount: unread,
      lastMessageAt: c.lastMessageAt,
      createdAt: c.createdAt,
    };
  });

  return NextResponse.json(result);
}

// ─── POST /api/messages — Send a message (creates conversation if needed) ─
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { receiverId, subject, content, conversationId } = await req.json();

  if (!receiverId || !content || !subject) {
    return NextResponse.json(
      { error: "receiverId, subject, and content are required" },
      { status: 400 }
    );
  }

  if (receiverId === user.id) {
    return NextResponse.json(
      { error: "Cannot send a message to yourself" },
      { status: 400 }
    );
  }

  // Verify receiver exists
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
  });
  if (!receiver) {
    return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
  }

  let convId = conversationId;

  if (!convId) {
    // Find or create conversation (ensure consistent ordering of participant IDs)
    const [p1, p2] = [user.id, receiverId].sort();
    let conversation = await prisma.conversation.findUnique({
      where: { participant1Id_participant2Id: { participant1Id: p1, participant2Id: p2 } },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: p1,
          participant2Id: p2,
          lastMessageAt: new Date(),
        },
      });
    }
    convId = conversation.id;
  } else {
    // Verify the user is a participant in this conversation
    const conv = await prisma.conversation.findUnique({
      where: { id: convId },
    });
    if (!conv || (conv.participant1Id !== user.id && conv.participant2Id !== user.id)) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }
  }

  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId,
      conversationId: convId,
      subject,
      content,
    },
  });

  // Update conversation's lastMessageAt
  await prisma.conversation.update({
    where: { id: convId },
    data: { lastMessageAt: new Date() },
  });

  return NextResponse.json(message, { status: 201 });
}