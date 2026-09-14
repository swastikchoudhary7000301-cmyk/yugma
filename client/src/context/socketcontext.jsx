import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { io } from "socket.io-client";

import { useAuth } from "./AuthContext";

const SocketContext =
  createContext(null);

export const SocketProvider = ({
  children,
}) => {
  const { user } = useAuth();

  const [socket, setSocket] =
    useState(null);

  const [onlineUsers, setOnlineUsers] =
    useState({});

  useEffect(() => {
    if (!user?._id && !user?.id) {
      setSocket(null);
      setOnlineUsers({});
      return;
    }

    const userId =
      user._id || user.id;

    const newSocket = io(
      import.meta.env.VITE_SOCKET_URL ||
        "http://localhost:5000",
      {
        transports: [
          "websocket",
          "polling",
        ],
        withCredentials: true,
      }
    );

    newSocket.on(
      "connect",
      () => {
        console.log(
          "Socket connected:",
          newSocket.id
        );

        newSocket.emit(
          "user-online",
          userId
        );
      }
    );

    newSocket.on(
      "user-status",
      ({
        userId: changedUserId,
        online,
      }) => {
        if (!changedUserId) return;

        setOnlineUsers(
          (previous) => ({
            ...previous,
            [String(changedUserId)]:
              online,
          })
        );
      }
    );

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const value = {
    socket,
    onlineUsers,
  };

  return (
    <SocketContext.Provider
      value={value}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

export default SocketContext;