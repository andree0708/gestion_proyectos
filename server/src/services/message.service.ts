import prisma from '../config/db.js';

export const getOrCreateConversation = async (orderId: string) => {
  let conversation = await prisma.conversation.findUnique({
    where: { orderId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { orderId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }
  return conversation;
};

export const getMyConversations = async (orgId: string) => {
  const orders = await prisma.order.findMany({
    where: { OR: [{ sellerOrgId: orgId }, { buyerOrgId: orgId }] },
    select: { id: true },
  });
  const orderIds = orders.map(o => o.id);

  return prisma.conversation.findMany({
    where: { orderId: { in: orderIds } },
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      order: {
        include: {
          offer: { include: { listing: { select: { title: true } } } },
          buyer: { select: { name: true } },
          seller: { select: { name: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
};

export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId, content, attachments: [] },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);
  return message;
};

export const getMessages = async (conversationId: string) => {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });
};
