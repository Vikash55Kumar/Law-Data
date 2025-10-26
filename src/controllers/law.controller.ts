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
  formData.append("file", fs.createReadStream(file.path), file.originalname);

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
  try {
    const lawDoc = await LawModel.create({
      category,
      act_name,
      act_details: extractedData.data.extracted_text,
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
    throw new ApiError(500, error.message);
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
