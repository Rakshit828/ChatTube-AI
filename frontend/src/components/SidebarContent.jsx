import React, { useEffect, useState } from 'react'
import { BsThreeDotsVertical } from "react-icons/bs";
import { PenBox } from "lucide-react";
import NewChatModal from './NewChatModel';



const SidebarContent = ({ sidebar, isMobile, handleCreateNewChat }) => {
    const [chats, setChats] = React.useState([
        "What are vectors?",
        "Explain quantum computing",
        "What is the capital of France?"
    ]);

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

                        {chats?.map((chat, idx) => (
                            <Chat key={idx} chat={chat} />
                        ))}

                    </div>
                </div>
            )}

        </div>

    )
}


const Chat = ({ chat }) => (
    <div
        className="flex justify-between items-center p-2 sm:p-3 w-full text-white text-sm sm:text-base rounded-lg hover:bg-gray-800 cursor-pointer transition-colors duration-200 group"
    >
        <span className="truncate flex-1 mr-2">{chat}</span>
        <BsThreeDotsVertical
            size={16}
            color="white"
            className="opacity-0 group-hover:opacity-70 hover:opacity-100 cursor-pointer flex-shrink-0 transition-opacity duration-200"
        />
    </div>
);



export default SidebarContent
