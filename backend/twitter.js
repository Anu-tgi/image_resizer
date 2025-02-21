const express = require("express");
const multer = require("multer");
const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const SIZES = [
  { width: 300, height: 250 },
  { width: 728, height: 90 },
  { width: 160, height: 600 },
  { width: 300, height: 600 },
];

router.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const resizedImages = [];
  for (let size of SIZES) {
    const outputPath = `uploads/resized_${size.width}x${size.height}.jpg`;
    await sharp(req.file.path).resize(size.width, size.height).toFile(outputPath);
    resizedImages.push(outputPath);
  }

  res.json({ images: resizedImages });
});

router.post("/post-twitter", async (req, res) => {
  const { images } = req.body;
  if (!images || images.length === 0) return res.status(400).json({ error: "No images to post" });

  try {
    const mediaIds = [];
    for (const imagePath of images) {
      const imageData = fs.readFileSync(imagePath, { encoding: "base64" });
      const uploadResponse = await axios.post(
        "https://upload.twitter.com/1.1/media/upload.json",
        { media_data: imageData }
      );
      mediaIds.push(uploadResponse.data.media_id_string);
    }

    const tweetResponse = await axios.post(
      "https://api.twitter.com/2/tweets",
      { text: "Here are my resized images!", media: { media_ids: mediaIds } }
    );

    res.json({ success: true, tweet: tweetResponse.data });
  } catch (error) {
    res.status(500).json({ error: "Failed to post images." });
  }
});

module.exports = router;
