
import { BACKEND_URL } from "../Utils/api.jsx";
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import {
  MessageCircle,
  Send,
  Users,
  RefreshCw,
} from "lucide-react";

const TeamChat = () => {
  const userState = useSelector((store) => store.user);
  const currentUser = userState?.user || userState;
  const role = currentUser?.role;

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const selectedContactRef = useRef(null);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  // Real-time Socket.IO connection
  useEffect(() => {
    if (!currentUser?._id) return;

    const socket = io(BACKEND_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("receiveMessage", (message) => {
      const senderId = String(
        message.sender?._id || message.sender || ""
      );

      const openContactId = String(
        selectedContactRef.current?._id || ""
      );

      if (senderId !== openContactId) return;

      setMessages((previous) => {
        const exists = previous.some(
          (item) =>
            String(item._id) === String(message._id)
        );

        if (exists) return previous;

        return [...previous, message];
      });
    });

    socket.on("connect_error", (error) => {
      console.error("Chat connection failed:", error.message);
      setError(
        "Real-time chat connection failed: " + error.message
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser?._id]);

  // API helper
  const apiRequest = async (path, options = {}) => {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
          `Request failed (${response.status}) at ${path}`
      );
    }

    return data;
  };

  // Load contacts
  const loadContacts = async () => {
    setLoadingContacts(true);
    setError("");

    try {
      let allContacts = [];

      if (role === "employee") {
        const [membersData, adminData] = await Promise.all([
          apiRequest("/api/employee/team-members"),
          apiRequest("/api/employee/team-admin"),
        ]);

        const members =
          membersData.data ||
          membersData.members ||
          membersData.employees ||
          [];

        const admin =
          adminData.admin ||
          adminData.teamAdmin ||
          adminData.data?.admin ||
          null;

        allContacts = [
          ...(Array.isArray(members) ? members : []),
          ...(admin ? [admin] : []),
        ];
      } else if (role === "admin") {
        const employeesData = await apiRequest(
          "/api/admin/employees"
        );

        const employees =
          employeesData.data ||
          employeesData.employees ||
          [];

        allContacts = Array.isArray(employees)
          ? employees
          : [];
      } else {
        throw new Error(
          `Unsupported chat role: ${role || "role not found"}`
        );
      }

      const uniqueContacts = allContacts.filter(
        (contact, index, array) =>
          contact?._id &&
          contact._id !== currentUser?._id &&
          array.findIndex(
            (item) => item?._id === contact._id
          ) === index
      );

      setContacts(uniqueContacts);

      if (uniqueContacts.length === 0) {
        setError("No chat contacts found.");
      }
    } catch (err) {
      console.error("CONTACT LOADING ERROR:", err);
      setError(err.message || "Could not load contacts.");
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    if (role) {
      loadContacts();
    }
  }, [role]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Open conversation
  const loadMessages = async (contact) => {
    if (!contact?._id) return;

    setSelectedContact(contact);
    selectedContactRef.current = contact;
    setMessages([]);
    setLoadingMessages(true);
    setError("");

    try {
      const data = await apiRequest(
        `/api/chat/${contact._id}`
      );

      const receivedMessages =
        data.messages ||
        data.data?.messages ||
        data.data ||
        [];

      setMessages(
        Array.isArray(receivedMessages)
          ? receivedMessages
          : []
      );
    } catch (err) {
      console.error("MESSAGE LOADING ERROR:", err);
      setError(err.message || "Could not load messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message
  const sendMessage = async (event) => {
    event.preventDefault();

    const text = messageText.trim();

    if (!text || !selectedContact || sending) return;

    setSending(true);
    setError("");

    try {
      const data = await apiRequest(
        `/api/chat/${selectedContact._id}`,
        {
          method: "POST",
          body: JSON.stringify({ message: text }),
        }
      );

      const newMessage =
        data.data ||
        data.messageData ||
        data.message;

      if (newMessage && typeof newMessage === "object") {
        setMessages((previous) => {
          const exists = previous.some(
            (item) =>
              String(item._id) ===
              String(newMessage._id)
          );

          if (exists) return previous;

          return [...previous, newMessage];
        });
      } else {
        await loadMessages(selectedContact);
      }

      setMessageText("");
    } catch (err) {
      console.error("SEND MESSAGE ERROR:", err);
      setError(err.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  const getSenderId = (message) => {
    const sender =
      message.senderId || message.sender;

    return typeof sender === "object"
      ? sender?._id
      : sender;
  };

  const getMessageText = (message) =>
    message.message ||
    message.text ||
    message.content ||
    "";

  const getContactName = (contact) =>
    contact?.name ||
    contact?.fullName ||
    contact?.email ||
    "User";

  return (
    <div className="flex h-[calc(100vh-100px)] min-h-[500px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:flex-row">
      {/* Contacts */}
      <aside className="flex w-full flex-col border-b border-gray-200 md:w-80 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Users size={21} className="text-blue-600" />
            <h2 className="text-lg font-semibold">
              Team Chat
            </h2>
          </div>

          <button
            type="button"
            onClick={loadContacts}
            disabled={loadingContacts}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            title="Refresh contacts"
          >
            <RefreshCw
              size={18}
              className={
                loadingContacts ? "animate-spin" : ""
              }
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? (
            <p className="p-4 text-sm text-gray-500">
              Loading contacts...
            </p>
          ) : contacts.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">
              No contacts available.
            </p>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact._id}
                type="button"
                onClick={() => loadMessages(contact)}
                className={`flex w-full items-center gap-3 border-b border-gray-100 p-4 text-left hover:bg-gray-50 ${
                  selectedContact?._id === contact._id
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                  {getContactName(contact)
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-800">
                    {getContactName(contact)}
                  </p>

                  <p className="truncate text-xs capitalize text-gray-500">
                    {contact.role || "Team member"}
                  </p>
                </div>

                <MessageCircle
                  size={17}
                  className="shrink-0 text-gray-400"
                />
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat */}
      <section className="flex min-h-0 flex-1 flex-col">
        {selectedContact ? (
          <>
            <div className="flex items-center gap-3 border-b p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                {getContactName(selectedContact)
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">
                  {getContactName(selectedContact)}
                </h3>

                <p className="text-xs capitalize text-gray-500">
                  {selectedContact.role || "Team member"}
                </p>
              </div>
            </div>

            {/* Message list */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
              {loadingMessages ? (
                <p className="text-center text-sm text-gray-500">
                  Loading messages...
                </p>
              ) : messages.length === 0 ? (
                <p className="pt-8 text-center text-sm text-gray-500">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((message, index) => {
                  const senderId = getSenderId(message);

                  const isMine =
                    senderId &&
                    String(senderId) ===
                      String(currentUser?._id);

                  return (
                    <div
                      key={message._id || index}
                      className={`flex ${
                        isMine
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          isMine
                            ? "rounded-br-sm bg-blue-600 text-white"
                            : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {getMessageText(message)}
                        </p>

                        {message.createdAt && (
                          <p
                            className={`mt-1 text-right text-[10px] ${
                              isMine
                                ? "text-blue-100"
                                : "text-gray-400"
                            }`}
                          >
                            {new Date(
                              message.createdAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form
              onSubmit={sendMessage}
              className="flex items-center gap-2 border-t bg-white p-3"
            >
              <input
                type="text"
                value={messageText}
                onChange={(event) =>
                  setMessageText(event.target.value)
                }
                placeholder="Type your message..."
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={!messageText.trim() || sending}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={17} />

                <span className="hidden sm:inline">
                  {sending ? "Sending..." : "Send"}
                </span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 rounded-full bg-blue-50 p-5">
              <MessageCircle
                size={38}
                className="text-blue-600"
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-800">
              Welcome to Team Chat
            </h3>

            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Select a contact to view messages and start chatting.
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="border-t border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}
      </section>
    </div>
  );
};

export default TeamChat;
