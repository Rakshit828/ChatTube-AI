import { X } from "lucide-react";
import { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import Spinner from "./Spinner";


const NewChatModal = ({ isOpen, onClose }) => {
    const { createNewChat, chats, setChats } = useContext(ChatContext);
    const { header } = useContext(AuthContext);

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    console.log("ERROR : ", error)
    if (!isOpen) return null;

    const handleCreateChat = async (chatData) => {
        try {
            setIsLoading(true)
            const response = await createNewChat(chatData, header);
            setIsLoading(false)
            const new_chat = response?.data
            setChats([...chats, new_chat])
            onClose();
        } catch (error) {
            setIsLoading(false)
            setError(error.response?.data?.detail || error?.message)
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
            {/* Blurred background */}
            <div
                className="absolute inset-0 backdrop-blur-sm bg-opacity-10 "
                onClick={onClose}
            />

            {/* Modal content */}
            <div className="relative bg-gray-900 rounded-xl w-full max-w-md p-6 shadow-lg z-10">
                {/* Close button */}
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-white"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>

                <h2 className="text-white text-lg font-semibold mb-4">Create New Chat</h2>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const title = e.target.title.value;
                        const videoUrl = e.target.videoUrl.value;
                        const chatData = { title: title, youtubeVideo: videoUrl };
                        handleCreateChat(chatData);
                    }}
                    className="flex flex-col gap-4"
                >
                    <div className="flex flex-col">
                        <label htmlFor="title" className="text-gray-300 mb-1 text-sm">
                            Chat Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            required
                            placeholder="Enter chat title"
                            className="bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="videoUrl" className="text-gray-300 mb-1 text-sm">
                            Video URL
                        </label>
                        <input
                            id="videoUrl"
                            name="videoUrl"
                            type="url"
                            required
                            placeholder="Enter video URL"
                            className="bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {isLoading && <Spinner />}
                    {error && <p className="text-red-800 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-md py-2 transition-colors"
                    >
                        Create Chat
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewChatModal;
