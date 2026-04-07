import prisma from "../prisma.config";
// import { TaskStatus, TaskPriority } from "@prisma/client";
// import { CreateTaskInput, UpdateTaskInput } from "../model/models";

export const createTag = async(name: string)=>{
    return prisma.tag.create({
        data: {name: name.toLowerCase().trim()}
    })
}

export const getTags = async()=>{
    return prisma.tag.findMany({
        orderBy: {name: 'asc'}
    })
}

export const getTag = async(tagId: number)=>{
    return prisma.tag.findUnique({
        where: {id: tagId}
    })
}

export const getTagByName = async(name: string)=>{
    return prisma.tag.findUnique({
        where: {name: name.toLowerCase().trim()}
    })
}

export const assignTagsToTask = async(taskId: number, tagIds: number[])=>{
    return prisma.taskTag.createMany({
        data: tagIds.map((tagId)=>({taskId, tagId})), skipDuplicates: true
    })
}

export const removeTagFromTask = async(taskId: number, tagId: number)=>{
    return prisma.taskTag.delete({
        where: {taskId_tagId: {taskId, tagId}}
    })
}

export const getTaskTag = async(taskId: number, tagId: number)=>{
    return prisma.taskTag.findUnique({
        where: {taskId_tagId: {taskId, tagId}}
    })
}

export const getTasksByTag = async (tagId: number, userId: number) => {
  return prisma.task.findMany({
    where: {
      userId,
      tags: {
        some: { tagId },
      },
    },
    include: {
      tags: {
        include: { tag: true },
      },
      _count: {
        select: { attachments: true, comments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};