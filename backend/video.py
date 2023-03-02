from moviepy.editor import ImageSequenceClip, AudioFileClip, CompositeVideoClip

# List of image file names
image_files = [f'composite-out/{5*i}.png'.format(i) for i in range(1, 32)]

# Duration of each image (in seconds)
durations = [0.5 * (31 - i)/32 + 0.1 for i in range(1, 32)]
durations[-1] = 2.0

print([x for x in zip(image_files, durations)])
# Create video clip
clip = ImageSequenceClip(image_files, durations=durations)

# Set video duration
clip_duration = sum(durations)
clip = clip.set_duration(clip_duration)

clip.fps = 30

# Load audio file
# audio = AudioFileClip('loop.mp3')

# # Trim audio clip to match video duration
# audio_duration = audio.duration
# if audio_duration > clip_duration:
#     audio = audio.subclip(audio_duration-clip_duration-3.2, audio_duration)

# # Add audio to video
# video = CompositeVideoClip([clip.set_audio(audio)])

# Save video
video.write_videofile("output.mp4")
