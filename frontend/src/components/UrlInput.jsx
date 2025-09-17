import { AiFillYoutube } from 'react-icons/ai'

const UrlInput = ({ url, setUrl, setEmbedUrl }) => {
  const handleSubmit = () => {
    let videoId = ''
    if (url.includes('youtube.com/watch')) {
      const params = new URLSearchParams(new URL(url).search)
      videoId = params.get('v')
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0]
    }
    if (videoId) setEmbedUrl(`https://www.youtube.com/embed/${videoId}?controls=0&rel=0&modestbranding=1`)
  }

  return (
    <div className="mx-auto w-full max-w-full px-2 sm:max-w-md">
      <div className="flex items-center">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube URL..."
          className="flex-1 px-2 py-2 rounded-l-lg bg-gray-800 text-white placeholder-gray-400 shadow-md focus:outline-none transition"
        />
        <button
          onClick={handleSubmit}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-r-lg shadow-md flex items-center justify-center transition"
        >
          <AiFillYoutube size={16} />
        </button>
      </div>
    </div>
  )
}

export default UrlInput;
