from fastapi import FastAPI
from TTS.api import TTS
import uuid
import os
import librosa
import soundfile as sf
import numpy as np

# =========================
# FastAPI
# =========================
app = FastAPI()

AUDIO_DIR = "public/audio"
os.makedirs(AUDIO_DIR, exist_ok=True)

# =========================
# TTS модель
# =========================
tts = TTS(
    model_name="tts_models/uk/mai/vits",
    progress_bar=False,
    gpu=False
)

# =========================
# Профілі голосів персонажів
# =========================
VOICE_PROFILES = {
    "princess": {
        "speed": 0.90,
        "pitch": +2,
        "volume_db": -0.8
    },
    "bunny": {
        "speed": 0.85,
        "pitch": +4,
        "volume_db": -0.5
    },
    "robot": {
        "speed": 1.00,
        "pitch": -2,
        "volume_db": -0.3
    }
}

# =========================
# 🔊 Нормалізація гучності
# =========================
def normalize_audio(y, target_db=-1.0):
    peak = np.max(np.abs(y))
    if peak == 0:
        return y

    target_peak = 10 ** (target_db / 20)
    gain = target_peak / peak
    return y * gain


# =========================
# 🎛 Post-processing
# =========================
def post_process(path, profile):
    y, sr = librosa.load(path, sr=None)

    # 🎵 Pitch shift
    if profile["pitch"] != 0:
        y = librosa.effects.pitch_shift(
            y,
            sr=sr,
            n_steps=profile["pitch"]
        )

    # 🔊 Нормалізація + підсилення
    y = normalize_audio(y, target_db=profile["volume_db"])

    sf.write(path, y, sr)


# =========================
# 🔊 API /tts
# =========================
@app.post("/tts")
def tts_endpoint(data: dict):
    text = (data.get("text") or "").strip()
    character = data.get("character", "princess")

    if not text:
        return { "error": "Empty text" }

    profile = VOICE_PROFILES.get(character, VOICE_PROFILES["princess"])

    filename = f"tts_{uuid.uuid4().hex}.wav"
    path = os.path.join(AUDIO_DIR, filename)

    # 🗣 Генерація голосу
    tts.tts_to_file(
        text=text,
        file_path=path,
        speed=profile["speed"]
    )

    # 🎚 Обробка (pitch + гучність)
    post_process(path, profile)

    return {
        "url": f"/audio/{filename}"
    }
