import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Node } from "../models/node.model";
import { Story } from "../models/story.model";

// Get all nodes for a story
export const getNodesByStoryId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { storyId } = req.params;

    const nodeRepository = AppDataSource.getRepository(Node);

    const nodes = await nodeRepository.find({
      where: { storyId },
      relations: ["choices"],
    });

    res.status(200).json(nodes);
  } catch (error) {
    console.error("Get nodes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific node
export const getNodeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const nodeRepository = AppDataSource.getRepository(Node);

    const node = await nodeRepository.findOne({
      where: { id },
      relations: ["choices", "story"],
    });

    if (!node) {
      res.status(404).json({ message: "Node not found" });
      return;
    }

    // Check if user has access to this story's nodes
    const storyRepository = AppDataSource.getRepository(Story);
    const story = await storyRepository.findOne({
      where: { id: node.storyId },
    });

    if (!story) {
      res.status(404).json({ message: "Story not found" });
      return;
    }

    // If story is not published and user is not the author, deny access
    if (!story.isPublished && (!req.user || req.user.id !== story.authorId)) {
      res.status(403).json({
        message: "This node belongs to an unpublished story",
      });
      return;
    }

    res.status(200).json(node);
  } catch (error) {
    console.error("Get node error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new node
export const createNode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { storyId, content, isEnding, title } = req.body;

    if (!storyId || !content) {
      res.status(400).json({
        message: "Story ID and content are required",
      });
      return;
    }

    // Check if user is the author of the story
    const storyRepository = AppDataSource.getRepository(Story);
    const story = await storyRepository.findOne({
      where: { id: storyId },
    });

    if (!story) {
      res.status(404).json({ message: "Story not found" });
      return;
    }

    if (story.authorId !== req.user.id) {
      res.status(403).json({
        message: "You can only add nodes to your own stories",
      });
      return;
    }

    // Create the node
    const nodeRepository = AppDataSource.getRepository(Node);
    const newNode = nodeRepository.create({
      storyId,
      content,
      isEnding: isEnding || false,
      title: title || null,
    });

    const savedNode = await nodeRepository.save(newNode);

    res.status(201).json({
      message: "Node created successfully",
      node: savedNode,
    });
  } catch (error) {
    console.error("Create node error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a node
export const updateNode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { content, isEnding, title } = req.body;

    const nodeRepository = AppDataSource.getRepository(Node);

    const node = await nodeRepository.findOne({
      where: { id },
      relations: ["story"],
    });

    if (!node) {
      res.status(404).json({ message: "Node not found" });
      return;
    }

    // Check if user is the author of the story
    const storyRepository = AppDataSource.getRepository(Story);
    const story = await storyRepository.findOne({
      where: { id: node.storyId },
    });

    if (!story) {
      res.status(404).json({ message: "Story not found" });
      return;
    }

    if (story.authorId !== req.user.id) {
      res.status(403).json({
        message: "You can only update nodes in your own stories",
      });
      return;
    }

    // Update node fields
    if (content !== undefined) node.content = content;
    if (title !== undefined) node.title = title;
    if (isEnding !== undefined) node.isEnding = isEnding;

    const updatedNode = await nodeRepository.save(node);

    res.status(200).json({
      message: "Node updated successfully",
      node: updatedNode,
    });
  } catch (error) {
    console.error("Update node error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a node
export const deleteNode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const nodeRepository = AppDataSource.getRepository(Node);

    const node = await nodeRepository.findOne({
      where: { id },
      relations: ["story"],
    });

    if (!node) {
      res.status(404).json({ message: "Node not found" });
      return;
    }

    // Check if user is the author of the story
    const storyRepository = AppDataSource.getRepository(Story);
    const story = await storyRepository.findOne({
      where: { id: node.storyId },
    });

    if (!story) {
      res.status(404).json({ message: "Story not found" });
      return;
    }

    if (story.authorId !== req.user.id) {
      res.status(403).json({
        message: "You can only delete nodes in your own stories",
      });
      return;
    }

    await nodeRepository.remove(node);

    res.status(200).json({
      message: "Node deleted successfully",
    });
  } catch (error) {
    console.error("Delete node error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
