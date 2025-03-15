import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Story } from "../models/story.model";
import { Node } from "../models/node.model";
import { Choice } from "../models/choice.model";

// Get all published stories
export const getAllStories = async (req: Request, res: Response) => {
  try {
    const storyRepository = getRepository(Story);

    // Get only published stories for public view
    const stories = await storyRepository.find({
      where: { isPublished: true },
      relations: ["author"],
      select: [
        "id",
        "title",
        "description",
        "coverImage",
        "createdAt",
        "updatedAt",
      ],
    });

    // Transform response to exclude sensitive data
    const formattedStories = stories.map((story) => ({
      ...story,
      author: story.author
        ? {
            id: story.author.id,
            username: story.author.username,
          }
        : null,
    }));

    res.status(200).json(formattedStories);
  } catch (error) {
    console.error("Get all stories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get story by ID
export const getStoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const storyRepository = getRepository(Story);

    const story = await storyRepository.findOne({
      where: { id },
      relations: ["author"],
    });

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Check if story is published or if requester is the author
    if (!story.isPublished && (!req.user || req.user.id !== story.authorId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Format response
    const { author, ...storyData } = story;
    const formattedStory = {
      ...storyData,
      author: {
        id: author.id,
        username: author.username,
      },
    };

    res.status(200).json(formattedStory);
  } catch (error) {
    console.error("Get story by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new story
export const createStory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, description, coverImage } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const storyRepository = getRepository(Story);
    const nodeRepository = getRepository(Node);

    // Create the story
    const newStory = storyRepository.create({
      title,
      description,
      coverImage,
      authorId: req.user.id,
      isDraft: true,
      isPublished: false,
    });

    const savedStory = await storyRepository.save(newStory);

    // Create initial node
    const initialNode = nodeRepository.create({
      content: "Your story begins here...",
      title: "Beginning",
      storyId: savedStory.id,
    });

    const savedNode = await nodeRepository.save(initialNode);

    // Update story with first node ID
    savedStory.firstNodeId = savedNode.id;
    await storyRepository.save(savedStory);

    res.status(201).json({
      message: "Story created successfully",
      story: savedStory,
    });
  } catch (error) {
    console.error("Create story error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update story
export const updateStory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { title, description, coverImage, isDraft, isPublished } = req.body;

    const storyRepository = getRepository(Story);

    // Find the story
    const story = await storyRepository.findOne({
      where: { id },
      relations: ["author"],
    });

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Check if user is the author
    if (story.authorId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update story fields
    if (title) story.title = title;
    if (description !== undefined) story.description = description;
    if (coverImage !== undefined) story.coverImage = coverImage;
    if (isDraft !== undefined) story.isDraft = isDraft;
    if (isPublished !== undefined) story.isPublished = isPublished;

    const updatedStory = await storyRepository.save(story);

    res.status(200).json({
      message: "Story updated successfully",
      story: updatedStory,
    });
  } catch (error) {
    console.error("Update story error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete story
export const deleteStory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const storyRepository = getRepository(Story);

    // Find the story
    const story = await storyRepository.findOne({
      where: { id },
    });

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Check if user is the author
    if (story.authorId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete the story
    await storyRepository.remove(story);

    res.status(200).json({ message: "Story deleted successfully" });
  } catch (error) {
    console.error("Delete story error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
