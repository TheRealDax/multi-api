/**
 * @swagger
 * /base64:
 *   post:
 *     summary: Convert an image to base64.
 *     tags: [Image]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: The URL of the image to convert.
 *     responses:
 *       200:
 *         description: Successfully converted image to base64.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: The base64-encoded image.
 *                 mimeType:
 *                   type: string
 *                   description: The MIME type of the image.
 *       400:
 *         description: Bad request. Missing or invalid imageUrl in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message.
 */

const fetch = require('node-fetch');
const fs = require('fs');
const { promisify } = require('util');
const { pipeline } = require('stream');

const base64 = async (req, res) => {
    try {
      const { imageUrl } = req.body;
        if (!imageUrl) {
            res.status(400).json({ error: 'Missing imageUrl' });
            return;
        }

      const response = await fetch(imageUrl);
      const contentType = response.headers.get('content-type');
      const tmp = '/tmp/temp_image.jpg';

      if (!contentType.startsWith('image/')) {
        throw new Error('The provided URL is not an image.');
      }
  
      const pipelineAsync = promisify(pipeline);
      await pipelineAsync(response.body, fs.createWriteStream(tmp));
  
      const base64Image = fs.readFileSync(tmp, 'base64');
      fs.unlinkSync(tmp);
  
      return res.status(200).json({
        result: base64Image,
        mimeType: contentType,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  };

module.exports = base64;