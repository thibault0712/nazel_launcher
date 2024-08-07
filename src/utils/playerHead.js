//If player hasn't got a skin url we will verify if a skin exist for the username in real Minecraft
const Jimp = require('jimp');
const axios = require('axios');


async function getPlayerHead(pseudo) {

  try {
    const response = await axios.get('http://82.65.207.221:81/' + pseudo + '.json');
    const data = response.data;
    return getHeadFromSkinUrl(data.skins.default);
  } catch (error) {
    return getHeadFromPseudo(pseudo);
  }
}

async function getHeadFromPseudo(pseudo) {
  const fetch = (await import('node-fetch')).default;

    // Download image from url
    const response = await fetch("https://mc-heads.net/avatar/" + pseudo);
    if (!response.ok) return null;
    
    // Convert image to buffer
    const buffer = await response.buffer();
    return buffer;
}

async function getHeadFromSkinUrl(userID) {
  try {
    const skinUrl = "http://82.65.207.221:81/textures/" + userID
    const fetch = (await import('node-fetch')).default;

    // Download image skin
    const response = await fetch(skinUrl);
    if (!response.ok) throw new Error('Failed to download skin image');
    const buffer = await response.buffer();
    const image = await Jimp.read(buffer);

    // Extract principal head (8x8 pixels from pixel (8, 8))
    const headMain = image.clone().crop(8, 8, 8, 8);

    // Extract helmet (8x8 pixels from pixel (40, 8))
    const headOverlay = image.clone().crop(40, 8, 8, 8);

    // Combine elements
    headMain.composite(headOverlay, 0, 0, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1
    });

    // Resize picture for better quality
    const size = 64; 
    headMain.resize(size, size, Jimp.RESIZE_NEAREST_NEIGHBOR);

    // Convert Image to buffer
    const headBuffer = await headMain.getBufferAsync(Jimp.MIME_PNG);
    return headBuffer;

  } catch (error) {
    //url problem
    return getHeadFromPseudo(pseudo);
  }
}

module.exports = {getPlayerHead}