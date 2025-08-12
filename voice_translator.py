import gradio as gr
import openai
from gtts import gTTS
import os
import soundfile as sf

openai.api_key = "YOUR_API_KEY"

def speech_to_text(audio_path):
    with open(audio_path, "rb") as audio_file:
        transcript = openai.Audio.transcribe("whisper-1", audio_file)
    return transcript['text']

def translate_text(text, target_language):
    prompt = f"Translate the following text to {target_language}:\n{text}"
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "system", "content": prompt}]
    )
    return response['choices'][0]['message']['content']

def text_to_speech(text, target_language):
    tts = gTTS(text=text, lang=target_language)
    tts.save("translated_audio.mp3")
    return "translated_audio.mp3"

def translate_audio(audio, target_language):
    recognized_text = speech_to_text(audio)
    translated_text = translate_text(recognized_text, target_language)
    audio_file = text_to_speech(translated_text, target_language)
    return translated_text, audio_file

interface = gr.Interface(
    fn=translate_audio,
    inputs=[
        gr.Audio(source="microphone", type="filepath", label="Speak Something"),
        gr.Dropdown(["en", "fr", "es", "de", "hi", "ja"], label="Select Target Language")
    ],
    outputs=[
        gr.Textbox(label="Translated Text"),
        gr.Audio(label="Translated Audio")
    ],
    title="AI Voice Translator",
    description="Speak in one language and get translated text + audio in another language."
)

interface.launch()
