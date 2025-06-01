const express = require('express');
const path = require('path');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Set ffmpeg and ffprobe binary paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// Define storage for uploaded files
const storage = multer.diskStorage({
     destination: function (req, file, cb) {
          cb(null, 'src/uploads/');
     },
     filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, uniqueSuffix + path.extname(file.originalname));
     }
});

const upload = multer({
     storage: storage,
     limits: { fileSize: 10 * 1024 * 1024 }, // Limit upload to 10MB
     fileFilter: function (req, file, cb) {
          const filetypes = /jpeg|jpg|png|gif|mp4|mp3/;
          const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
          if (extname) {
               return cb(null, true);
          } else {
               cb(new Error('Accepted file formats: image, video, or audio'));
          }
     }
}).single('file');

// Function to determine audio bitrate based on bandwidth
function determineAudioBitrate(bandwidth) {
     if (bandwidth > 5000) { // Bandwidth greater than 5000 kbps
          return '320k'; // High-quality audio
     } else if (bandwidth > 2000) { // Bandwidth between 2000 and 5000 kbps
          return '192k'; // Medium-quality audio
     } else { // Bandwidth less than or equal to 2000 kbps
          return '128k'; // Standard-quality audio
     }
}

// Function to split media (video or audio) into HLS segments
function splitMediaToHLS(inputMediaPath, outputFolder, audioBitrate, uniqueId, isAudio, callback) {
     const outputPath = path.join(outputFolder, `${uniqueId}.m3u8`);

     // Configure ffmpeg for either video or audio processing
     const ffmpegCommand = ffmpeg(inputMediaPath)
          .output(outputPath)
          .audioBitrate(audioBitrate)
          .outputOptions([
               '-hls_time', '10',
               '-hls_list_size', '0',
               '-hls_segment_filename', `${outputFolder}/${uniqueId}_%03d.ts`
          ]);

     if (isAudio) {
          ffmpegCommand.noVideo();
     }

     ffmpegCommand
          .on('end', function () {
               console.log('HLS conversion complete');
               callback(null);
          })
          .on('error', function (err) {
               console.error('Error during HLS conversion:', err.message);
               callback(err);
          })
          .run();
}

// Route for handling file upload and HLS conversion
router.post('/', (req, res) => {
     upload(req, res, function (err) {
          if (err instanceof multer.MulterError) {
               return res.status(500).json({ error: 'File upload error: ' + err.message });
          } else if (err) {
               return res.status(400).json({ error: 'File error: ' + err.message });
          }
          if (!req.file) {
               return res.status(400).json({ error: 'Please select a file to upload.' });
          }

          const inputMediaPath = req.file.path;
          const outputDir = "src/uploads/hls";
          if (!fs.existsSync(outputDir)) {
               fs.mkdirSync(outputDir, { recursive: true });
          }

          const uniqueId = uuidv4();

          // Simulate getting bandwidth from the request (you can replace this logic with actual bandwidth retrieval)
          const bandwidth = req.headers['x-bandwidth']; // Example: getting bandwidth from a custom header
          console.log("req.headers['x-bandwidth']", req.headers['x-bandwidth'])
          const audioBitrate = determineAudioBitrate(bandwidth);

          const isAudio = path.extname(req.file.originalname).toLowerCase() === '.mp3';

          splitMediaToHLS(inputMediaPath, outputDir, audioBitrate, uniqueId, isAudio, (err) => {
               if (err) {
                    return res.status(500).json({ error: 'An error occurred during the HLS conversion process.' });
               }

               res.status(200).json({
                    message: 'HLS conversion successful!',
                    playlistUrl: `/uploads/hls/${uniqueId}.m3u8`
               });
          });
     });
});

module.exports = router;
