import api from "./api";

export const getConversations =
  async () => {
    const response = await api.get(
      "/chat/conversations"
    );

    return response.data;
  };

export const createConversation =
  async (receiverId) => {
    if (!receiverId) {
      throw new Error(
        "Receiver ID is required"
      );
    }

    const response = await api.post(
      "/chat/conversations",
      {
        receiverId,
      }
    );

    return response.data;
  };

export const getMessages = async (
  conversationId
) => {
  if (!conversationId) {
    throw new Error(
      "Conversation ID is required"
    );
  }

  const response = await api.get(
    `/chat/conversations/${conversationId}/messages`
  );

  return response.data;
};

export const sendMessage = async (
  conversationId,
  receiverId,
  text,
  image = ""
) => {
  if (!conversationId) {
    throw new Error(
      "Conversation ID is required"
    );
  }

  if (!receiverId) {
    throw new Error(
      "Receiver ID is required"
    );
  }

  if (
    !text?.trim() &&
    !image
  ) {
    throw new Error(
      "Message cannot be empty"
    );
  }

  const response = await api.post(
    "/chat/messages",
    {
      conversationId,
      receiverId,
      text: text?.trim() || "",
      image,
    }
  );

  return response.data;
};

export const markMessagesAsRead =
  async (conversationId) => {
    const response = await api.put(
      `/chat/conversations/${conversationId}/read`
    );

    return response.data;
  };

export default {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
};