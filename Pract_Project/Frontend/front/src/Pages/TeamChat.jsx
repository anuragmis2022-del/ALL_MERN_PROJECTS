
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { MessageCircle, Send, Users, RefreshCw } from "lucide-react";
import { BACKEND_URL } from "../Utils/api.jsx";

function TeamChat() {
  // 1. Get logged-in user
 const currentUser = useSelector((store) => store.user);
const role = currentUser?.role;

  // 2. Store data
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

  // Keep the latest selected contact for Socket.IO
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  // 3. Connect to Socket.IO
  useEffect(() => {
    if (!currentUser?._id) return;

    const socket = io(BACKEND_URL, {
      withCredentials: true,
    });

    socket.on("receiveMessage", (message) => {
      let sender = message.senderId || message.sender;

      if (typeof sender === "object") {
        sender = sender?._id;
      }

      const openContact = selectedContactRef.current;

      if (!openContact) return;
      if (String(sender) !== String(openContact._id)) return;

      setMessages((oldMessages) => {
        for (const item of oldMessages) {
          if (String(item._id) === String(message._id)) {
            return oldMessages;
          }
        }

        return [...oldMessages, message];
      });
    });

    socket.on("connect_error", () => {
      setError("Real-time chat connection failed.");
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser?._id]);

  // 4. Send a request to the backend
  async function apiRequest(path, options = {}) {
  const requestOptions = {
    method: options.method || "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (options.body) {
    requestOptions.body = options.body;
  }

  const response = await fetch(BACKEND_URL + path, requestOptions);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
  // 5. Load contacts
  async function loadContacts() {
    setLoadingContacts(true);
    setError("");

    try {
      let allContacts = [];

      if (role === "employee") {
        const membersData = await apiRequest(
          "/api/employee/team-members"
        );

        const adminData = await apiRequest(
          "/api/employee/team-admin"
        );

        let members = membersData.data;

        if (!members) members = membersData.members;
        if (!members) members = membersData.employees;
        if (!Array.isArray(members)) members = [];

        let admin = adminData.admin;

        if (!admin) admin = adminData.teamAdmin;
        if (!admin) admin = adminData.data?.admin;

        allContacts = [...members];

        if (admin) {
          allContacts.push(admin);
        }
      } else if (role === "admin") {
        const employeesData = await apiRequest(
          "/api/admin/employees"
        );

        let employees = employeesData.data;

        if (!employees) employees = employeesData.employees;
        if (!Array.isArray(employees)) employees = [];

        allContacts = employees;
      } else {
        throw new Error("This role cannot use Team Chat.");
      }

      // Remove yourself and duplicate contacts
      const uniqueContacts = [];

      for (const contact of allContacts) {
        if (!contact || !contact._id) continue;

        if (String(contact._id) === String(currentUser._id)) {
          continue;
        }

        let alreadyExists = false;

        for (const item of uniqueContacts) {
          if (String(item._id) === String(contact._id)) {
            alreadyExists = true;
            break;
          }
        }

        if (!alreadyExists) {
          uniqueContacts.push(contact);
        }
      }

      setContacts(uniqueContacts);

      if (uniqueContacts.length === 0) {
        setError("No chat contacts found.");
      }
    } catch (error) {
      console.error("Contact loading error:", error.message);
      setError(error.message || "Could not load contacts.");
    } finally {
      setLoadingContacts(false);
    }
  }

  useEffect(() => {
    if (role) {
      loadContacts();
    }
  }, [role]);

  // 6. Load messages for the selected contact
  async function loadMessages(contact) {
    if (!contact || !contact._id) return;

    setSelectedContact(contact);
    selectedContactRef.current = contact;
    setMessages([]);
    setLoadingMessages(true);
    setError("");

    try {
      const data = await apiRequest("/api/chat/" + contact._id);

      let chatMessages = data.messages;

      if (!chatMessages) chatMessages = data.data?.messages;
      if (!chatMessages) chatMessages = data.data;
      if (!Array.isArray(chatMessages)) chatMessages = [];

      setMessages(chatMessages);
    } catch (error) {
      console.error("Message loading error:", error.message);
      setError(error.message || "Could not load messages.");
    } finally {
      setLoadingMessages(false);
    }
  }

  // 7. Send a message
  async function sendMessage(event) {
    event.preventDefault();

    const text = messageText.trim();

    if (!text || !selectedContact || sending) return;

    setSending(true);
    setError("");

    try {
      const data = await apiRequest(
        "/api/chat/" + selectedContact._id,
        {
          method: "POST",
          body: JSON.stringify({ message: text }),
        }
      );

      let newMessage = data.data;

      if (!newMessage || typeof newMessage !== "object") {
        newMessage = data.messageData;
      }

      if (!newMessage || typeof newMessage !== "object") {
        newMessage = data.message;
      }

      if (newMessage && typeof newMessage === "object") {
        setMessages((oldMessages) => {
          for (const item of oldMessages) {
            if (String(item._id) === String(newMessage._id)) {
              return oldMessages;
            }
          }

          return [...oldMessages, newMessage];
        });
      } else {
        await loadMessages(selectedContact);
      }

      setMessageText("");
    } catch (error) {
      console.error("Send message error:", error.message);
      setError(error.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  }

  // 8. Get the sender's ID
  function getSenderId(message) {
    let sender = message.senderId || message.sender;

    if (typeof sender === "object") {
      sender = sender?._id;
    }

    return sender;
  }

  // 9. Get message text
  function getMessageText(message) {
    if (message.message) return message.message;
    if (message.text) return message.text;
    if (message.content) return message.content;

    return "";
  }

  // 10. Get contact name
  function getContactName(contact) {
    if (contact.name) return contact.name;
    if (contact.fullName) return contact.fullName;
    if (contact.email) return contact.email;

    return "User";
  }

  // 11. Scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-100px)] min-h-[500px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:flex-row">
      {/* CONTACT LIST */}
      <aside className="flex w-full flex-col border-b border-gray-200 md:w-80 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Users size={21} className="text-blue-600" />
            <h2 className="text-lg font-semibold">Team Chat</h2>
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
              className={loadingContacts ? "animate-spin" : ""}
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
                  selectedContact?._id === contact._id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                  {getContactName(contact).charAt(0).toUpperCase()}
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

      {/* CHAT WINDOW */}
      <section className="flex min-h-0 flex-1 flex-col">
        {selectedContact ? (
          <>
            <div className="flex items-center gap-3 border-b p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                {getContactName(selectedContact).charAt(0).toUpperCase()}
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
                    String(senderId) === String(currentUser?._id);

                  return (
                    <div
                      key={message._id || index}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
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
                              isMine ? "text-blue-100" : "text-gray-400"
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

            <form
              onSubmit={sendMessage}
              className="flex items-center gap-2 border-t bg-white p-3"
            >
              <input
                type="text"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
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
              <MessageCircle size={38} className="text-blue-600" />
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
}

export default TeamChat;
