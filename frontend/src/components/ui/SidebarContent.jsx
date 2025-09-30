import { useContext, useEffect, useState, useRef } from 'react'
import { BsThreeDotsVertical } from "react-icons/bs";
import { PenBox } from "lucide-react";
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';


const SidebarContent = ({ sidebar, isMobile, handleCreateNewChat }) => {
    console.log("Rendering from SidebarContent")
    const {
        chats,
        setChats,
        deleteChat,
        updateChat, 

        loadAllQAs,
        loadAllChats,
        selectedChatID,
        setSelectedChatID,
        setQAs,
        handleSetURLs
    } = useContext(ChatContext)

    const { header } = useContext(AuthContext)

    useEffect(() => {
        const handleLoadAllChats = async () => {
            const response = await loadAllChats(header)
            if (response.success) {
                console.log(response.data)
                setChats(response.data)
            }
        }
        handleLoadAllChats()
    }, [])


    const handleLoadAllQAs = async (chatID, youtubeVideoURL) => {
        console.log("Loding QAs req gone")
        const response = await loadAllQAs(chatID, header)
        console.log(response.data)
        if (response.success) {
            setQAs(response.data)
            handleSetURLs(youtubeVideoURL)
        }
        setSelectedChatID(chatID)
        return response.data
    }

    return (
        <div className="flex flex-col flex-1 overflow-y-auto">
            {/* New Chat button */}
            <div
                id="new-chat"
                className={`
              h-12 sm:h-14 flex items-center
              ${sidebar ? "justify-start px-3 gap-3 sm:gap-4" : "justify-center"}
              text-white rounded-lg hover:bg-gray-800 cursor-pointer transition-colors duration-200 w-full
            `}
                onClick={handleCreateNewChat}
            >
                <PenBox size={20} color="white" />
                {sidebar && <span className="truncate ml-2">New Chat</span>}
            </div>

            {/* Rest of content only if expanded */}
            {(sidebar || isMobile) && (
                <div id="chats" className="w-full mt-4 sm:mt-6 text-gray-400 px-3">
                    <div className="text-xs sm:text-sm font-medium mb-2">Recent Chats</div>
                    <div className="space-y-1">

                        {chats?.map((chat) => {
                            return <Chat 
                                key={chat.uuid} 
                                chatID={chat.uuid} 
                                chatTitle={chat.title} 
                                video={chat.youtube_video} 
                                onClick={async () => {
                                    await handleLoadAllQAs(chat.uuid, chat.youtube_video)
                                }}
                                isSelected={selectedChatID == chat.uuid ? true : false}

                                header={header}
                                deleteChat={deleteChat}
                                updateChat={updateChat}
                                setSelectedChatID={setSelectedChatID}
                                setChats={setChats}
                                setQAs={setQAs}
                            />
                        })}

                    </div>
                </div>
            )}
        </div>

    )
}


const Chat = ({ chatID, chatTitle, video, onClick, isSelected, setSelectedChatID, header, deleteChat, updateChat, setQAs, setChats }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleDeleteChat = async (event) => {
        event.preventDefault()
        setSelectedChatID(chatID)
        console.log("Chat ID", chatID)
        const response = await deleteChat(chatID, header)
        if(response.success){
            setQAs([]);
            setChats(prev => prev.filter(chats => chats.uuid !== chatID));
        }
    }

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <div
            className={`
                flex justify-between items-center p-2 sm:p-3 w-full text-sm sm:text-base rounded-lg cursor-pointer transition-colors duration-200 group relative
                ${isSelected ? 'bg-gray-700' : 'text-white hover:bg-gray-800'}
            `}
            onClick={async (event) => {
                event.preventDefault();
                await onClick(video);
            }}
        >
            <span className="truncate flex-1 mr-2">{chatTitle}</span>
            <div className="relative" ref={menuRef}>
                <BsThreeDotsVertical
                    size={16}
                    className="opacity-0 group-hover:opacity-70 hover:opacity-100 cursor-pointer flex-shrink-0 transition-opacity duration-200"
                    onClick={e => {
                        e.stopPropagation();
                        setMenuOpen((open) => !open);
                    }}
                />
                {menuOpen && (
                    <div className="absolute right-0 top-6 z-20 w-32 bg-gray-800 border border-gray-700 rounded shadow-lg py-1 flex flex-col">
                        <button
                            className="px-4 py-2 text-left text-sm text-gray-100 hover:bg-gray-700"
                            onClick={e => {
                                e.stopPropagation();
                                setMenuOpen(false);
                                // TODO: Implement rename logic here
                                alert("Rename clicked");
                            }}
                        >
                            Rename
                        </button>
                        <button
                            className="px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700"
                            onClick={handleDeleteChat}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


export default SidebarContent
