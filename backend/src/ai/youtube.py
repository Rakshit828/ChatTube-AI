from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled


youtube_transcript_api = YouTubeTranscriptApi()


def load_video_transcript(vid_id: str) -> str:
    """Return the transcript of the video in string format"""
    try:
        transcript = youtube_transcript_api.fetch(video_id=vid_id, languages=["en"])
        transcript_text_list = [transcript_snippet.text for transcript_snippet in transcript]
        transcript_text = " ".join(transcript_text_list)
        return transcript_text
    
    except Exception as e:
        print(f"Transcript Failed {e}")
        raise Exception