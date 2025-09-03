// const AWS = require('aws-sdk');
// const prisma = require('../prisma-client');
// const { v4: uuidv4 } = require('uuid');
// const sharp = require('sharp');
import prisma from '../../lib/prisma.js';
import jwt from 'jsonwebtoken';
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// replaced S3 bucket by blackbaze b2 bucket
//const s3 = new S3Client({ region: "ap-south-1" }); // change region

// This endpoint fetches the posts from users the logged-in user follows, ordered by creation time. 
// export const getFeed = async(req,res) => {
//     const body = req.body
//     const tokenUserId = req.userId
//     try{
//         const following = await prisma.follow.findMany({
//             where: { followerId: tokenUserId },
//             select: { followingId: true },
//         });

//         const followingIds = following.map(f => f.followingId);
//         const posts = await prisma.newsFeedPost.findMany({
//             where: { userId: { in: followingIds } },
//             include: { user: true, likes: true, comments: true },
//             orderBy: { createdAt: 'desc' },
//         });
//         res.json(posts);
//     } catch(err){
//         res.status(500).json({message:'Failed to get activity feed posts !'})
//     }
// }

// // replaced AWS S3 bucket by blackbaze b2 bucket 

// Generate Upload URL
// export const generateUploadURL = async (fileName, fileType) => {
//   const command = new PutObjectCommand({
//     Bucket: "your-bucket-name",
//     Key: fileName,
//     ContentType: fileType,
//   });

//   const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 }); // 60s
//   return uploadURL;
// };


// // Generate Download URL
// export const generateDownloadURL = async (fileName) => {
//   const command = new GetObjectCommand({
//     Bucket: "your-bucket-name",
//     Key: fileName,
//   });

//   const downloadURL = await getSignedUrl(s3, command, { expiresIn: 60 });
//   return downloadURL;
// };


const b2 = new S3Client({
  region: process.env.REGION,  // Backblaze region, ex: "us-west-002"
  endpoint: process.env.B2_ENDPOINT, // Backblaze S3 endpoint
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY
  },
  forcePathStyle: true  // important for B2 compatibility
});

const BUCKET = process.env.B2_BUCKET;


// 1. Generate signed URL for upload

export const signUpload = async (req , res) => {
 try {
    const { files } = req.body; // [{ fileName, fileType }]
    if (!files) return res.status(400).json({ message: "files[] required" });

    const results = await Promise.all(
      files.map(async ({ fileName, fileType }) => {
        const key = `${Date.now()}_${fileName}`;

        const command = new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          ContentType: fileType,
        });

        const uploadURL = await getSignedUrl(b2, command, { expiresIn: 300 });

        // Public CDN URL via Cloudflare (no cost)
        const cdnUrl = `${process.env.B2_ENDPOINT}/${BUCKET}/${key}`;

        return { key, uploadURL, cdnUrl };
      })
    );

    res.json({ files: results });
  } catch (err) {
    console.error("B2 sign error:", err);
    res.status(500).json({ message: "Failed to sign upload" });
  }
} 


// 2. Signed GET URL (if bucket is private)

export const signDownload = async (req , res) => {
        const body = req.body
        const tokenUserId = req.userId
 try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ message: "key required" });

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    const downloadURL = await getSignedUrl(b2, command, { expiresIn: 300 });
    res.json({ downloadURL });
  } catch (err) {
    console.error("B2 download error:", err);
    res.status(500).json({ message: "Failed to sign download" });
  }
}

export const createPost = async (req,res) =>{
    const body = req.body
    const tokenUserId = req.userId
    try{
        const newPost = await prisma.newsFeedPost.create({
            data:{
                ...body.newPost,
                media:body.media,
                userId:tokenUserId,
               // tags:body.tags
              //  tags:{set:{...body.tags}}
            }
        }).catch((err)=>{
            console.log(err)
        })
        res.status(200).json(newPost)
    }catch (err){
        console.log(err);
        res.status(500).json({message:"Failed to add post !"})
    }
}

/// This endpoint fetches the posts from users the logged-in user follows, ordered by creation time. 
export const getPosts = async (req, res) => {
    const  userId  = req.userId;

    try {
        const followingIds = await prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });

        const posts = await prisma.newsFeedPost.findMany({
            where: { userId: { in: followingIds.map(f => f.followingId) } },
            include: {
                user: true,  // To get details about the post author
                likes: true,  // Include the likes count
                comments: true,  // Include comments count
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
};

//get singlepost 
export const getPostById = async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await prisma.newsFeedPost.findUnique({
            where: { id: postId },
            include: {
                user: true,
                likes: true,
                comments: {
                    include: { user: true },
                },
            },
        });

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
};


export const getUserPosts = async (req, res) => {
    const { userId } = req.params;
    console.log(userId)
    try {
        const posts = await prisma.post.findMany({
            where: { userId },
            include: {
                likes: true,
                comments: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user posts' });
    }
};

// //  // // // // // // // // AWS S3 configuration
// const s3 = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
//     region: process.env.AWS_REGION,
// });

// const createPost = async (req, res) => {
//     const { userId, caption, tags } = req.body;
//     const files = req.files; // Assumes using multer for file handling

//     try {
//         const mediaUploads = await Promise.all(files.map(async (file) => {
//             const key = `${uuidv4()}-${file.originalname}`;
//             const uploadParams = {
//                 Bucket: process.env.AWS_BUCKET_NAME,
//                 Key: key,
//                 Body: file.buffer,
//                 ACL: 'public-read',
//             };
//             const uploadedData = await s3.upload(uploadParams).promise();
//             const cloudfrontUrl = `${process.env.CLOUDFRONT_URL}/${key}`;
//             return cloudfrontUrl;
//         }));

//         const post = await prisma.post.create({
//             data: {
//                 caption,
//                 userId,
//                 media: mediaUploads, // URLs from S3
//                 tags: { set: tags }, // Tags are list of user IDs
//             },
//         });

//         res.status(201).json(post);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to create post' });
//     }
// };
