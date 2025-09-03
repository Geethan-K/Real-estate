import express from "express";
import bodyParser from "body-parser";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import prisma from "./prismaClient"; // your prisma client instance
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

// initialize S3 client (uses IAM credentials from env or instance profile)
const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.S3_BUCKET;
const SIGN_EXPIRES = parseInt(process.env.SIGN_URL_EXPIRES || "300", 10);
const CLOUDFRONT = process.env.CLOUDFRONT_DOMAIN; // e.g. d111abc.cloudfront.net

// 1) Generate presigned upload URL(s)
app.post("/s3/sign", async (req, res) => {
  // expect body: { files: [{ fileName, fileType }] }
  const { files } = req.body;
  if (!files || !Array.isArray(files)) return res.status(400).json({ message: "files[] required" });

  try {
    const results = await Promise.all(files.map(async ({ fileName, fileType }) => {
      // create a unique key (prefix with user id or timestamp to avoid collisions)
      const key = `${Date.now()}_${fileName}`;

      const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: fileType,
        ACL: undefined, // keep S3 object private; CloudFront OAC will be used to serve
        CacheControl: "max-age=31536000,public", // good cache control for static uploads (adjust)
      });

      const uploadURL = await getSignedUrl(s3, command, { expiresIn: SIGN_EXPIRES });

      // CloudFront URL that will serve object (once propagated and with OAC)
      const cdnUrl = `https://${CLOUDFRONT}/${encodeURIComponent(key)}`;

      return { fileName, key, uploadURL, cdnUrl };
    }));

    res.json({ files: results });
  } catch (err) {
    console.error("Sign error:", err);
    res.status(500).json({ message: "Failed to create signed urls" });
  }
});

/*
  2) Create the NewsFeedPost in Prisma
  Expect body:
  {
    caption: "...",
    mediaKeys: ["123_filename.jpg", "234_another.png"],  // keys returned from /s3/sign
    tags: [{ userId: "..." }, ...]  // or simple array of userIds
  }
*/
app.post("/posts", async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId; // assume middleware set req.userId after auth

  try {
    // Build media array of CDN URLs so frontend and users use CloudFront
    const mediaKeys = body.mediaKeys || []; // keys returned earlier
    const mediaUrls = mediaKeys.map(k => `https://${CLOUDFRONT}/${encodeURIComponent(k)}`);

    // Build tags nested create if tags provided as userIds
    // Tag model requires userId; nested create will set newFeedPost relation automatically
    let tagsCreate = undefined;
    if (Array.isArray(body.tags) && body.tags.length) {
      // Accept either [{ userId: "..." }, "useridstring", ...]
      tagsCreate = body.tags.map(t => typeof t === "string" ? { userId: t } : { userId: t.userId });
    }

    const newPost = await prisma.newsFeedPost.create({
      data: {
        caption: body.caption,
        media: mediaUrls,         // Prisma: String[] field
        userId: tokenUserId,      // set ownership
        // nested create tags
        ...(tagsCreate ? { tags: { create: tagsCreate } } : {}),
        // likes, comments, shares are created later by other endpoints
      }
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error("createPost error:", err);
    res.status(500).json({ message: "Failed to add post !" });
  }
});

app.listen(5000, () => console.log("Listening on 5000"));
