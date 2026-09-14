import api from "./api";

export const sendConnectionRequest = async (
  recipientId
) => {
  const response = await api.post(
    "/connections/request",
    {
      recipient: recipientId,
    }
  );

  return response.data;
};

export const getPendingRequests = async () => {
  const response = await api.get(
    "/connections/requests"
  );

  return response.data;
};

export const acceptConnectionRequest =
  async (connectionId) => {
    const response = await api.put(
      `/connections/requests/${connectionId}/accept`
    );

    return response.data;
  };

export const rejectConnectionRequest =
  async (connectionId) => {
    const response = await api.put(
      `/connections/requests/${connectionId}/reject`
    );

    return response.data;
  };

export const getMyConnections = async () => {
  const response = await api.get(
    "/connections/my"
  );

  return response.data;
};

export const getSuggestions = async () => {
  const response = await api.get(
    "/connections/suggestions"
  );

  return response.data;
};

export default {
  sendConnectionRequest,
  getPendingRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getMyConnections,
  getSuggestions,
};