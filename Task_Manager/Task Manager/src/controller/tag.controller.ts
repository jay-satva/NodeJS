import { Request, Response, NextFunction } from "express";
import * as TagService from "../service/tag.service";
import { ApiResponse } from "../types";

export const createTag = async(req: Request, res: Response, next: NextFunction): Promise<void> =>{
    try {
    const { name } = req.body
 
    if (!name) {
      res.status(400).json({
        responseStatus: 0,
        message: "Tag name is required.",
      } as ApiResponse)
      return
    }
    const tag = await TagService.createTag(name)
 
    res.status(201).json({
      responseStatus: 1,
      message: "Tag created successfully.",
      result: tag,
    } as ApiResponse)
  } catch (err) {
    next(err)
  }
}

export const getAllTags = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tags = await TagService.getAllTags();
 
    res.status(200).json({
      responseStatus: 1,
      message: "Tags retrieved successfully.",
      result: tags,
      totalRecord: tags.length,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const assignTagsToTask = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    try{
        
        const userId = req.user!.userId
        const taskId = parseInt(req.params.id, 10)
        const {tagIds} = req.body
        // console.log(req.body)
        // console.log(req.params)
        if(isNaN(taskId)){
            res.status(400).json({responseStatus: 0, message: "Invalid task ID"} as ApiResponse)
            return
        }
        // if(tagIds.size == 0 || !Array.isArray(tagIds)){
        //     res.status(400).json({responseStatus: 0, message: "TagID must be non empty array"} as ApiResponse)
        //     return
        // }

        const parsedTagIds = Array.isArray(tagIds)
      ? tagIds.map(Number).filter((n: number) => !isNaN(n))
      : []

      if (parsedTagIds.length === 0) {
        res.status(400).json({
          responseStatus: 0,
          message: "tagIds must be a non-empty array of tag IDs.",
        } as ApiResponse)
        return
      }
        const result = await TagService.assignTagsToTask(taskId, userId, tagIds)
        res.status(200).json({responseStatus: 1, message: "Success", result} as ApiResponse)
    }
    catch(err){
        next(err)
    }
}

export const removeTagFromTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const taskId = parseInt(req.params.id, 10)
    const tagId  = parseInt(req.params.tagId, 10)
 
    if (isNaN(taskId) || isNaN(tagId)) {
      res.status(400).json({ responseStatus: 0, message: "Invalid task ID or tag ID." } as ApiResponse)
      return
    }
 
    await TagService.removeTagFromTask(taskId, userId, tagId)
    res.status(200).json({
      responseStatus: 1,
      message: "Tag removed from task successfully.",
    } as ApiResponse)
  } catch (err) {
    next(err)
  }
}

export const getTasksByTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const tagId  = parseInt(req.params.tagId, 10);
 
    if (isNaN(tagId)) {
      res.status(400).json({ responseStatus: 0, message: "Invalid tag ID." } as ApiResponse);
      return;
    }
 
    const tasks = await TagService.getTasksByTag(tagId, userId);
 
    res.status(200).json({
      responseStatus: 1,
      message: "Tasks retrieved for tag.",
      result: tasks,
      totalRecord: tasks.length,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};