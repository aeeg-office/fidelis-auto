import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

// ─── GET /api/messages/[conversationId] — Read messages in a conversation ─
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await context.params;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participant1: { select: { id: true, name: true } },
      participant2: { select: { id: true, name: true } },
    },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  // Verify user is a participant
  if (
    conversation.participant1Id !== user.id &&
    conversation.participant2Id !== user.id
  ) {
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    );
  }

  const otherUser =
    conversation.participant1Id === user.id
      ? conversation.participant2
      : conversation.participant1;

  // Mark incoming messages as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      receiverId: user.id,
      read: false,
    },
    data: { read: true },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ conversation, otherUser, messages });
}