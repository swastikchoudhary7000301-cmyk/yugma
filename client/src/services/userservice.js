import api from "./api";

export const getMyProfile = async () => {
  const response = await api.get(
    "/users/profile"
  );

  return response.data;
};

export const getUserProfile = async (
  userId
) => {
  const response = await api.get(
    `/users/${userId}`
  );

  return response.data;
};

export const updateProfile = async (
  profileData
) => {
  const response = await api.put(
    "/users/profile",
    profileData
  );

  return response.data;
};

export const searchUsers = async (
  query
) => {
  const response = await api.get(
    `/users/search?q=${encodeURIComponent(
      query
    )}`
  );

  return response.data;
};

export default {
  getMyProfile,
  getUserProfile,
  updateProfile,
  searchUsers,
};