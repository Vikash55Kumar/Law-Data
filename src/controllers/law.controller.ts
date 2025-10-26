import { Request, Response } from "express";
import LawModel from "../models/law.models";
import { asyncHandler } from "../utility/asyncHandler";
import { ApiError } from "../utility/ApiError";
import ApiResponse from "../utility/ApiResponse";
import axios from "axios";
import * as fs from "fs";
import FormData from "form-data";

const registerLaw = asyncHandler(async (req: Request, res: Response) => {
  const { category, act_name } = req.body;

  if (!category || !act_name) {
    throw new ApiError(400, "Category and act_name are required.");
  }

  const file =
    (req.files &&
      (req.files as any)["file"] &&
      (req.files as any)["file"][0]) ||
    null;

  if (!file) {
    throw new ApiError(400, "File is required");
  }

  // file.path is the path to the file saved by multer
  const formData = new FormData();
  const filePath = (file && file.path) || null;
  let readStream: fs.ReadStream | null = null;

  try {
    if (!filePath) {
      throw new ApiError(400, "Uploaded file path is missing");
    }

    readStream = fs.createReadStream(filePath);
    formData.append("file", readStream, file.originalname);

    const extractedData = await axios.post(
      `${process.env.AI_MODEL_URL}/uploads`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    if (!extractedData.data.extracted_text) {
      throw new ApiError(500, "Failed to extract data from the document.");
    }

    // Normalize extracted text into plain text before storing.
    // Collapse all whitespace (newlines, tabs, multiple spaces) to single spaces and trim.
    const rawExtracted = String(extractedData.data.extracted_text || "");
    const plainText = rawExtracted.replace(/\s+/g, " ").trim();

    const lawDoc = await LawModel.create({
      category,
      act_name,
      act_details: plainText,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { law: lawDoc },
          "Law document created successfully"
        )
      );
  } catch (error: any) {
    throw new ApiError(500, error.message || String(error));
  } finally {
    // Ensure stream is closed/destroyed and temporary file is removed
    try {
      if (readStream) {
        // modern Node streams have close, destroy; attempt both safely
        try {
          // @ts-ignore - close may not exist on older stream types
          if (typeof readStream.close === "function") readStream.close();
        } catch (_) {}
        try {
          readStream.destroy();
        } catch (_) {}
      }
    } catch (_) {}

    if (filePath) {
      // use promises API to await unlink; swallow errors to avoid masking original error
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        // optional: you may want to log this in real app
        // console.warn(`Failed to remove temp file ${filPath}:`, err?.message || err);
      }
    }
  }
});

// get all laws
const getAllLaws = asyncHandler(async (req: Request, res: Response) => {
  try {
    const laws = await LawModel.find();
    if (!laws || laws.length === 0) {
      throw new ApiError(404, "No laws found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, laws, "Laws retrieved successfully"));
  } catch (error: any) {
    throw new ApiError(500, error.message);
  }
});

export { registerLaw, getAllLaws };
