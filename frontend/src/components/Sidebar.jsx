import { ArrowLeftCircle, PenBox, X } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import logo from "../assets/image.png";

const Sidebar = ({ sidebar, setSidebar, isMobile }) => {
  return (
    <>
      {/* Overlay on mobile */}
      {isMobile && sidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebar(false)}
        />
      )}

      {/* Sidebar container */}
      <div
        className={`
          ${isMobile ? "fixed top-0 left-0 h-screen z-50" : "relative h-screen"}
          flex flex-col bg-black overflow-auto
          transition-all duration-300 ease-in-out
          ${isMobile
                  ? sidebar
                    ? "translate-x-0 w-64 max-w-[80%]"
                    : "-translate-x-full w-64 max-w-[80%]"
                  : sidebar
                    ? "flex-none w-64"   /* expanded */
                    : "flex-none w-14"   /* collapsed */
                }
        `}
      >
        {/* Header */}
        <div className="flex w-full h-12 sm:h-14 justify-between items-center px-2">
          <img
            src={logo}
            alt="App Logo"
            className={`w-8 h-8 sm:w-10 sm:h-10 object-contain ${sidebar ? "block" : "hidden"
              }`}
          />
          {!isMobile ? (
            <ArrowLeftCircle
              color="white"
              size={24}
              className={`hover:opacity-70 cursor-pointer transition-all duration-200 ${sidebar ? "" : "rotate-180"
                }`}
              onClick={() => setSidebar(!sidebar)}
            />
          ) : (
            sidebar && (
              <X
                color="white"
                size={24}
                className="hover:opacity-70 cursor-pointer transition-all duration-200"
                onClick={() => setSidebar(false)}
              />
            )
          )}
        </div>

        {/* Sidebar content */}
        {sidebar && (
          <div className="flex flex-col flex-1 px-3 pb-4 overflow-y-auto">
            <div
              id="new-chat"
              className="mt-4 sm:mt-6 text-sm sm:text-base flex w-full h-10 sm:h-12 justify-start items-center p-2 sm:p-3 text-white gap-3 sm:gap-4 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors duration-200"
            >
              <PenBox size={16} color="white" />
              <span className="truncate">New Chat</span>
            </div>

            <div id="chats" className="w-full mt-4 sm:mt-6 text-gray-400">
              <div className="text-xs sm:text-sm font-medium mb-2 px-2">
                Recent Chats
              </div>
              <div className="space-y-1">
                {[
                  "RAG Course Discussion",
                  "Video Analysis Chat",
                  "Learning Session",
                ].map((chat, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 sm:p-3 w-full text-white text-sm sm:text-base rounded-lg hover:bg-gray-800 cursor-pointer transition-colors duration-200 group"
                  >
                    <span className="truncate flex-1 mr-2">{chat}</span>
                    <BsThreeDotsVertical
                      size={16}
                      color="white"
                      className="opacity-0 group-hover:opacity-70 hover:opacity-100 cursor-pointer flex-shrink-0 transition-opacity duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu button */}
      {isMobile && !sidebar && (
        <button
          onClick={() => setSidebar(true)}
          className="fixed top-4 left-4 z-50 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
        >
          <ArrowLeftCircle size={20} className="rotate-180" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
