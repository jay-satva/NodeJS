import * as TagRepo from "../repository/tag.repository";
import * as TaskRepo from "../repository/task.repository";

const fail = (message: string, status = 400)=>{
    const err = new Error(message) as Error & {status: number}
    err.status = status
    throw err
}

export const createTag = async(name: string)=>{
    if (!name || name.trim() === "") fail("Tag name is required.");
    const existing = await TagRepo.getTagByName(name);
    if (existing) fail("A tag with this name already exists.", 409);
    
    return TagRepo.createTag(name);
}

export const getAllTags = async()=>{
    return TagRepo.getTags()
}

export const getTag = async(tagId: number)=>{
    if(isNaN(tagId)){
        fail("Enter a valid TagId")
    }
    return TagRepo.getTag(tagId) 
}

export const assignTagsToTask = async(taskId: number, userId: number, tagIds: number[])=>{
    if (!tagIds || tagIds.length === 0) fail("At least one tagId is required.");
    const task = await TaskRepo.getTaskById(taskId, userId)
    if(!task) fail("This tag is not assigned to the task", 404) 
        for (const tagId of tagIds) {
    const tag = await TagRepo.getTag(tagId)
    if (!tag) fail(`Tag with id ${tagId} does not exist.`, 404)
  }
 
  return TagRepo.assignTagsToTask(taskId, tagIds)
}

export const removeTagFromTask = async (taskId: number, userId: number, tagId: number) => {
  const task = await TaskRepo.getTaskById(taskId, userId)
  if (!task) fail("Task not found or access denied.", 404)
  const taskTag = await TagRepo.getTaskTag(taskId, tagId)
  if (!taskTag) fail("This tag is not assigned to the task.", 404)
 
  return TagRepo.removeTagFromTask(taskId, tagId)
}

export const getTasksByTag = async (tagId: number, userId: number) => {
  const tag = await TagRepo.getTag(tagId);
  if (!tag) fail("Tag not found.", 404);
 
  return TagRepo.getTasksByTag(tagId, userId);
};