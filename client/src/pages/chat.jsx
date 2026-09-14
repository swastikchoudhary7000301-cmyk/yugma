import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Smile,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/socketcontext";

import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
} from "../services/chatservice";

const getId = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.id || null;
};

const getOtherParticipant = (
  conversation,
  currentUserId
) => {
  if (!conversation?.participants) {
    return null;
  }

  return (
    conversation.participants.find(
      (participant) =>
        String(getId(participant)) !==
        String(currentUserId)
    ) || null
  );
};

const getInitial = (name = "U") => {
  return (
    name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "U"
  );
};

const formatTime = (date) => {
  if (!date) return "";

  const messageDate = new Date(date);

  if (Number.isNaN(messageDate.getTime())) {
    return "";
  }

  return messageDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatConversationTime = (date) => {
  if (!date) return "";

  const messageDate = new Date(date);

  if (Number.isNaN(messageDate.getTime())) {
    return "";
  }

  const now = new Date();

  const sameDay =
    messageDate.toDateString() ===
    now.toDateString();

  if (sameDay) {
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return messageDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
};

const ChatAvatar = ({
  user,
  size = "normal",
  online = false,
}) => {
  const className =
    size === "large"
      ? "chat-avatar chat-avatar-large"
      : size === "small"
      ? "chat-avatar chat-avatar-small"
      : "chat-avatar";

  return (
    <div className="chat-avatar-wrapper">
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={user?.name || "User"}
          className={className}
        />
      ) : (
        <div className={className}>
          {getInitial(user?.name)}
        </div>
      )}

      {online && (
        <span className="chat-online-dot" />
      )}
    </div>
  );
};

const Chat = () => {
  const { user } = useAuth();

  const {
    socket,
    onlineUsers,
  } = useSocket();

  const [conversations, setConversations] =
    useState([]);

  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [messageText, setMessageText] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [typing, setTyping] =
    useState(false);

  const [error, setError] =
    useState("");

  const messagesEndRef =
    useRef(null);

  const typingTimeoutRef =
    useRef(null);

  const currentUserId =
    getId(user);

  const otherUser = useMemo(() => {
    return getOtherParticipant(
      selectedConversation,
      currentUserId
    );
  }, [
    selectedConversation,
    currentUserId,
  ]);

  const otherUserId =
    getId(otherUser);

  const isOtherUserOnline =
    otherUserId
      ? Boolean(
          onlineUsers?.[
            String(otherUserId)
          ]
        )
      : false;

  const filteredConversations =
    useMemo(() => {
      const query =
        searchText
          .trim()
          .toLowerCase();

      if (!query) {
        return conversations;
      }

      return conversations.filter(
        (conversation) => {
          const person =
            getOtherParticipant(
              conversation,
              currentUserId
            );

          return (
            person?.name
              ?.toLowerCase()
              .includes(query) ||
            person?.headline
              ?.toLowerCase()
              .includes(query)
          );
        }
      );
    }, [
      conversations,
      searchText,
      currentUserId,
    ]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);
  };

  const loadConversations =
    async () => {
      try {
        setLoadingConversations(true);
        setError("");

        const data =
          await getConversations();

        setConversations(
          data?.conversations || []
        );
      } catch (err) {
        console.error(
          "Conversation loading error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load conversations."
        );
      } finally {
        setLoadingConversations(false);
      }
    };

  const loadMessages = async (
    conversation
  ) => {
    if (!conversation?._id) {
      return;
    }

    try {
      setLoadingMessages(true);
      setError("");

      const data =
        await getMessages(
          conversation._id
        );

      setMessages(
        data?.messages || []
      );

      scrollToBottom();
    } catch (err) {
      console.error(
        "Messages loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load messages."
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  const selectConversation =
    async (conversation) => {
      if (!conversation?._id) {
        return;
      }

      if (
        selectedConversation?._id ===
        conversation._id
      ) {
        return;
      }

      if (socket) {
        if (
          selectedConversation?._id
        ) {
          socket.emit(
            "leave-conversation",
            selectedConversation._id
          );
        }

        socket.emit(
          "join-conversation",
          conversation._id
        );
      }

      setSelectedConversation(
        conversation
      );

      setMessages([]);

      await loadMessages(
        conversation
      );
    };

  useEffect(() => {
    if (!user) return;

    loadConversations();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (
      incomingMessage
    ) => {
      const conversationId =
        getId(
          incomingMessage?.conversation
        );

      if (
        !conversationId ||
        String(conversationId) !==
          String(
            selectedConversation?._id
          )
      ) {
        return;
      }

      setMessages((previous) => {
        const exists =
          previous.some(
            (message) =>
              String(message._id) ===
              String(
                incomingMessage._id
              )
          );

        if (exists) {
          return previous;
        }

        return [
          ...previous,
          incomingMessage,
        ];
      });

      setConversations(
        (previous) =>
          previous
            .map((conversation) => {
              if (
                String(
                  conversation._id
                ) !==
                String(conversationId)
              ) {
                return conversation;
              }

              return {
                ...conversation,
                lastMessage:
                  incomingMessage,
                updatedAt:
                  incomingMessage.createdAt ||
                  new Date(),
              };
            })
            .sort(
              (a, b) =>
                new Date(
                  b.updatedAt
                ) -
                new Date(
                  a.updatedAt
                )
            )
      );

      scrollToBottom();
    };

    socket.on(
      "receive-message",
      handleReceiveMessage
    );

    return () => {
      socket.off(
        "receive-message",
        handleReceiveMessage
      );
    };
  }, [
    socket,
    selectedConversation?._id,
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({
      userId,
    }) => {
      if (
        String(userId) ===
        String(otherUserId)
      ) {
        setTyping(true);
      }
    };

    const handleStopTyping = ({
      userId,
    }) => {
      if (
        String(userId) ===
        String(otherUserId)
      ) {
        setTyping(false);
      }
    };

    socket.on(
      "user-typing",
      handleTyping
    );

    socket.on(
      "user-stop-typing",
      handleStopTyping
    );

    return () => {
      socket.off(
        "user-typing",
        handleTyping
      );

      socket.off(
        "user-stop-typing",
        handleStopTyping
      );
    };
  }, [
    socket,
    otherUserId,
  ]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (
        typingTimeoutRef.current
      ) {
        clearTimeout(
          typingTimeoutRef.current
        );
      }
    };
  }, []);

  const handleTypingChange = (
    event
  ) => {
    const value =
      event.target.value;

    setMessageText(value);

    if (
      !socket ||
      !selectedConversation
    ) {
      return;
    }

    socket.emit("typing", {
      conversationId:
        selectedConversation._id,
      userId:
        currentUserId,
    });

    if (
      typingTimeoutRef.current
    ) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    typingTimeoutRef.current =
      setTimeout(() => {
        socket.emit(
          "stop-typing",
          {
            conversationId:
              selectedConversation._id,
            userId:
              currentUserId,
          }
        );
      }, 800);
  };

  const handleSendMessage =
    async (event) => {
      event?.preventDefault();

      const text =
        messageText.trim();

      if (
        !text ||
        sending ||
        !selectedConversation ||
        !otherUserId
      ) {
        return;
      }

      try {
        setSending(true);
        setError("");

        const data =
          await sendMessage(
            selectedConversation._id,
            otherUserId,
            text
          );

        const newMessage =
          data?.message;

        if (newMessage) {
          setMessages(
            (previous) => {
              const exists =
                previous.some(
                  (message) =>
                    String(
                      message._id
                    ) ===
                    String(
                      newMessage._id
                    )
                );

              if (exists) {
                return previous;
              }

              return [
                ...previous,
                newMessage,
              ];
            }
          );

          setConversations(
            (previous) =>
              previous
                .map(
                  (
                    conversation
                  ) => {
                    if (
                      String(
                        conversation._id
                      ) !==
                      String(
                        selectedConversation._id
                      )
                    ) {
                      return conversation;
                    }

                    return {
                      ...conversation,
                      lastMessage:
                        newMessage,
                      updatedAt:
                        newMessage.createdAt ||
                        new Date(),
                    };
                  }
                )
                .sort(
                  (a, b) =>
                    new Date(
                      b.updatedAt
                    ) -
                    new Date(
                      a.updatedAt
                    )
                )
          );
        }

        setMessageText("");

        if (socket) {
          socket.emit(
            "stop-typing",
            {
              conversationId:
                selectedConversation._id,
              userId:
                currentUserId,
            }
          );
        }

        scrollToBottom();
      } catch (err) {
        console.error(
          "Send message error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to send message."
        );
      } finally {
        setSending(false);
      }
    };

  const handleStartChat = async (
    receiverId
  ) => {
    try {
      setError("");

      const data =
        await createConversation(
          receiverId
        );

      const conversation =
        data?.conversation;

      if (!conversation) {
        return;
      }

      setConversations(
        (previous) => {
          const exists =
            previous.some(
              (item) =>
                String(item._id) ===
                String(
                  conversation._id
                )
            );

          if (exists) {
            return previous;
          }

          return [
            conversation,
            ...previous,
          ];
        }
      );

      await selectConversation(
        conversation
      );
    } catch (err) {
      console.error(
        "Start chat error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to start conversation."
      );
    }
  };

  return (
    <div className="chat-page">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-top">
          <Link
            to="/dashboard"
            className="chat-back"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={19} />
          </Link>

          <div className="chat-title">
            <h1>Messages</h1>
            <span>
              {conversations.length}{" "}
              conversations
            </span>
          </div>

          <button
            type="button"
            className="chat-icon-button"
            aria-label="More options"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>

        <div className="chat-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search messages"
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
          />
        </div>

        <div className="chat-list-heading">
          <span>Recent</span>
          <span>
            {filteredConversations.length}
          </span>
        </div>

        <div className="conversation-list">
          {loadingConversations ? (
            <div className="chat-list-state">
              <div className="loader small" />

              <p>
                Loading conversations...
              </p>
            </div>
          ) : filteredConversations.length ===
            0 ? (
            <div className="empty-conversations">
              <div className="empty-chat-icon">
                <MessageCircle size={24} />
              </div>

              <h3>
                No conversations yet
              </h3>

              <p>
                Connect with people and
                start a conversation.
              </p>

              <Link
                to="/connections"
                className="chat-connect-button"
              >
                <Users size={16} />
                Find people
              </Link>
            </div>
          ) : (
            filteredConversations.map(
              (conversation) => {
                const person =
                  getOtherParticipant(
                    conversation,
                    currentUserId
                  );

                const personId =
                  getId(person);

                const active =
                  String(
                    selectedConversation?._id
                  ) ===
                  String(
                    conversation._id
                  );

                const online =
                  personId
                    ? Boolean(
                        onlineUsers?.[
                          String(personId)
                        ]
                      )
                    : false;

                return (
                  <button
                    type="button"
                    key={
                      conversation._id
                    }
                    className={`conversation-item ${
                      active
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      selectConversation(
                        conversation
                      )
                    }
                  >
                    <ChatAvatar
                      user={person}
                      online={online}
                    />

                    <div className="conversation-info">
                      <div className="conversation-name-row">
                        <strong>
                          {person?.name ||
                            "Yugma User"}
                        </strong>

                        <small>
                          {formatConversationTime(
                            conversation
                              .lastMessage
                              ?.createdAt
                          )}
                        </small>
                      </div>

                      <p>
                        {conversation
                          .lastMessage
                          ?.text ||
                          "Start a conversation"}
                      </p>
                    </div>
                  </button>
                );
              }
            )
          )}
        </div>

        <div className="chat-sidebar-footer">
          <Link
            to="/connections"
            className="chat-new-connection"
          >
            <Users size={17} />
            Find connections
          </Link>
        </div>
      </aside>

      <main className="chat-main">
        {!selectedConversation ? (
          <div className="chat-empty-state">
            <div className="chat-empty-logo">
              <MessageCircle size={34} />
            </div>

            <span className="chat-empty-label">
              YUGMA MESSAGES
            </span>

            <h2>
              Your conversations
            </h2>

            <p>
              Select a conversation from
              the left to continue chatting
              with your network.
            </p>

            <Link
              to="/connections"
              className="primary-chat-action"
            >
              <Users size={17} />
              Find connections
            </Link>
          </div>
        ) : (
          <>
            <header className="chat-header">
              <div className="chat-header-user">
                <ChatAvatar
                  user={otherUser}
                  size="large"
                  online={
                    isOtherUserOnline
                  }
                />

                <div className="chat-header-details">
                  <h2>
                    {otherUser?.name ||
                      "Yugma User"}
                  </h2>

                  <span
                    className={
                      isOtherUserOnline
                        ? "online-text"
                        : ""
                    }
                  >
                    {typing
                      ? "Typing..."
                      : isOtherUserOnline
                      ? "Online now"
                      : otherUser?.headline ||
                        "Yugma member"}
                  </span>
                </div>
              </div>

              <div className="chat-header-actions">
                <button
                  type="button"
                  className="chat-icon-button"
                  aria-label="Search conversation"
                >
                  <Search size={18} />
                </button>

                <button
                  type="button"
                  className="chat-icon-button"
                  aria-label="More options"
                >
                  <MoreHorizontal
                    size={19}
                  />
                </button>
              </div>
            </header>

            {error && (
              <div
                className="chat-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="messages-container">
              {loadingMessages ? (
                <div className="chat-messages-loading">
                  <div className="loader small" />

                  <p>
                    Loading messages...
                  </p>
                </div>
              ) : messages.length ===
                0 ? (
                <div className="no-messages">
                  <div className="no-messages-icon">
                    <MessageCircle size={22} />
                  </div>

                  <h3>
                    Start the conversation
                  </h3>

                  <p>
                    Send a message to{" "}
                    {otherUser?.name ||
                      "this person"}{" "}
                    and start connecting.
                  </p>
                </div>
              ) : (
                <>
                  <div className="messages-day-label">
                    TODAY
                  </div>

                  {messages.map(
                    (message, index) => {
                      const senderId =
                        getId(
                          message.sender
                        );

                      const ownMessage =
                        String(
                          senderId
                        ) ===
                        String(
                          currentUserId
                        );

                      return (
                        <div
                          key={
                            message._id ||
                            `${message.createdAt}-${index}`
                          }
                          className={`message-row ${
                            ownMessage
                              ? "own"
                              : "received"
                          }`}
                        >
                          {!ownMessage && (
                            <ChatAvatar
                              user={
                                message.sender
                              }
                              size="small"
                            />
                          )}

                          <div className="message-group">
                            <div
                              className={`message-bubble ${
                                ownMessage
                                  ? "own"
                                  : "received"
                              }`}
                            >
                              {message.text && (
                                <p>
                                  {
                                    message.text
                                  }
                                </p>
                              )}

                              {message.image && (
                                <img
                                  src={
                                    message.image
                                  }
                                  alt="Shared"
                                  className="message-image"
                                />
                              )}
                            </div>

                            <div className="message-meta">
                              <span>
                                {formatTime(
                                  message.createdAt
                                )}
                              </span>

                              {ownMessage &&
                                (message.read ? (
                                  <CheckCheck
                                    size={
                                      13
                                    }
                                  />
                                ) : (
                                  <Check
                                    size={
                                      13
                                    }
                                  />
                                ))}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}

                  {typing && (
                    <div className="typing-row">
                      <ChatAvatar
                        user={otherUser}
                        size="small"
                      />

                      <div className="typing-bubble">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div
                ref={messagesEndRef}
              />
            </div>

            <form
              className="message-composer"
              onSubmit={
                handleSendMessage
              }
            >
              <button
                type="button"
                className="composer-icon"
                aria-label="Attach file"
              >
                <Paperclip size={18} />
              </button>

              <div className="composer-input-wrapper">
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={messageText}
                  onChange={
                    handleTypingChange
                  }
                  disabled={sending}
                />
              </div>

              <button
                type="button"
                className="composer-icon"
                aria-label="Add emoji"
              >
                <Smile size={18} />
              </button>

              <button
                type="submit"
                className="send-message-button"
                disabled={
                  sending ||
                  !messageText.trim()
                }
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default Chat;