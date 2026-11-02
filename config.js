// Everything you need to change lives in this one file.

window.CONFIG = {
  // The three lines on the banner.
  eyebrow: 'With love for',
  title: 'Their Name',
  occasion: 'On the occasion of their birthday',

  // The banner on the page where people write.
  // The small line above it reads "For " + title.
  invitation: 'Add your message',
  invitationNote:
    'Tell them about a moment you remember, or simply what they have meant to you.',

  // Your Apps Script web app URL — README step 2. It ends in /exec
  apiUrl: '',

  // Your Cloudinary details, for the photos — README step 3.
  // Neither is a secret: the cloud name is in every image URL and the
  // preset name is readable in this file. Never put your API key or
  // API secret here — an unsigned preset exists so you do not need to.
  cloudinary: {
    cloudName: '',
    uploadPreset: '',
  },

  // Longest edge a photo is resized to before sending, in pixels.
  photoMaxEdge: 1600,
  photoQuality: 0.82,
};
