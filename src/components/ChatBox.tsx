import { useState, useEffect } from 'react';
import { db } from '../firebase'; // Correct the import to point to 'firebase.ts'
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

const ChatBox = () => {
  const [messages, setMessages] = useState<any[]>([]); // Store messages as an array of objects
  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState<string>(''); // Dynamically set chatId for each guest

  // Generate a unique chatId for guests (use a timestamp or a random string)
  useEffect(() => {
    const generatedChatId = `guest-${Date.now()}`; // You can also use other methods to generate unique IDs
    setChatId(generatedChatId);
  }, []); // Set the chatId when the component mounts

  // Fetch messages from Firestore in real-time from the 'messages' sub-collection
  useEffect(() => {
    if (chatId) {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => doc.data());
        setMessages(fetchedMessages); // Store the entire message object
      });

      // Clean up the listener when the component is unmounted
      return () => unsubscribe();
    }
  }, [chatId]); // Re-run the effect if chatId changes

  // Send a message to the Firestore 'messages' sub-collection
  const sendMessage = async () => {
    if (message.trim()) {
      try {
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          chatId,
          sender: 'guest', // Set sender as 'guest' or the actual user
          text: message,
          timestamp: new Date(),
        });
        setMessage(''); // Clear the message input field after sending
      } catch (error) {
        console.error('Error adding message: ', error);
      }
    }
  };

  return (
    <div className="fixed bottom-20 right-5 w-80 p-4 bg-white shadow-lg rounded-lg border border-gray-300">
      <div className="flex flex-col space-y-2 overflow-y-auto max-h-60">
        {/* Display messages */}
        {messages.map((msg, index) => (
          <div key={index} className="p-2 bg-gray-100 rounded-lg">
            {/* Display sender and message */}
            <strong>{msg.sender}: </strong>{msg.text}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center">
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button
          className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
