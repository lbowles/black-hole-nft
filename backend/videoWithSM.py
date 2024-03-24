from moviepy.editor import *

# Define the file names and their corresponding solar masses
file_names = [f"composite-out/{i}.png" for i in range(2, 154)]
solar_masses = [i for i in range(2, 154)]

# Define the planet names based on solar mass
def get_planet_name(mass):
    if mass < 5:
        return "MICRO"
    elif mass < 38:
        return "STELLAR"
    elif mass < 57:
        return "INTERMEDIATE"
    elif mass < 152:
        return "SUPERMASSIVE"
    else:
        return "PRIMORDIAL"

# Define the size of the video and the duration of each frame
size = (800, 800)
duration = 0.1  # seconds

# Define the function that adds the solar mass and planet name text to the video
def add_text(txt_clip, position):
    txt_clip = txt_clip.set_pos(position)
    return txt_clip

# Create the video clip by iterating through the file names and their corresponding solar masses
clips = []
for file_name, solar_mass in zip(file_names, solar_masses):
    planet_name = get_planet_name(solar_mass)
    img_clip = ImageClip(file_name).set_duration(duration)
    solar_mass_clip = TextClip(f"{solar_mass} SM", fontsize=20, color='white', font='VT323').set_duration(duration)
    planet_name_clip = TextClip(f"{planet_name}", fontsize=20, color='white', font='VT323').set_duration(duration)
    solar_mass_clip = add_text(solar_mass_clip, ('right', 'bottom'))
    planet_name_clip = add_text(planet_name_clip, ('left', 'bottom'))
    final_clip = CompositeVideoClip([img_clip, solar_mass_clip, planet_name_clip])
    clips.append(final_clip)

# Add the last frame for an additional 30 frames
last_frame = ImageClip(file_names[-1]).set_duration(3)
solar_mass_clip = TextClip("152 SM", fontsize=20, color='white', font='VT323').set_duration(3)
planet_name_clip = TextClip("PRIMORDIAL", fontsize=20, color='white', font='VT323').set_duration(3)
solar_mass_clip = add_text(solar_mass_clip, ('right', 'bottom'))
planet_name_clip = add_text(planet_name_clip, ('left', 'bottom'))
final_clip = CompositeVideoClip([last_frame, solar_mass_clip, planet_name_clip])
clips.append(final_clip)

# Concatenate all the clips into the final video clip
final_clip = concatenate_videoclips(clips)

# Load the background music clip
audio_clip = AudioFileClip("loop.mp3").set_duration(final_clip.duration)

# Set the audio clip as the background music for the final video clip
final_clip = final_clip.set_audio(audio_clip)
video = CompositeVideoClip([final_clip.set_audio(audio_clip)])

# Write the final video file
video.write_videofile("output.mp4", fps=24)
