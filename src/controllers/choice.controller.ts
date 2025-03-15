import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Choice } from "../models/choice.model";
import { Node } from "../models/node.model";
import { Story } from "../models/story.model";

// Get choices for a specific node
export const getChoicesByNodeId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nodeId } = req.params;

    const choiceRepository = AppDataSource.getRepository(Choice);

    const choices = await choiceRepository.find({
      where: { sourceNodeId: nodeId },
      order: { order: "ASC" },
    });

    res.status(200).json(choices);
  } catch (error) {
    console.error("Get choices error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new choice
export const createChoice = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { sourceNodeId, targetNodeId, text, order } = req.body;

    if (!sourceNodeId || !targetNodeId || !text) {
      res.status(400).json({
        message: "Source node ID, target node ID, and text are required",
      });
      return;
    }

    // Verify both nodes exist and belong to the same story
    const nodeRepository = AppDataSource.getRepository(Node);

    const sourceNode = await nodeRepository.findOne({
      where: { id: sourceNodeId },
      relations: ["story"],
    });

    if (!sourceNode) {
      res.status(404).json({ message: "Source node not found" });
      return;
    }

    const targetNode = await nodeRepository.findOne({
      where: { id: targetNodeId },
    });

    if (!targetNode) {
      res.status(404).json({ message: "Target node not found" });
      return;
    }

    if (sourceNode.storyId !== targetNode.storyId) {
      res.status(400).json({
        message: "Source and target nodes must belong to the same story",
      });
      return;
    }

    // Check if user is the author of the story
    const storyRepository = AppDataSource.getRepository(Story);
    const story = await storyRepository.findOne({
      where: { id: sourceNode.storyId },
    });

    if (!story) {
      res.status(404).json({ message: "Story not found" });
      return;
    }

    if (story.authorId !== req.user.id) {
      res.status(403).json({
        message: "You can only add choices to your own stories",
      });
      return;
    }

    // Get current max order for choices in this node
    const choiceRepository = AppDataSource.getRepository(Choice);

    const maxOrderChoice = await choiceRepository.findOne({
      where: { sourceNodeId },
      order: { order: "DESC" },
    });

    const nextOrder = maxOrderChoice ? maxOrderChoice.order + 1 : 0;

    const newChoice = choiceRepository.create({
      sourceNodeId,
      targetNodeId,
      text,
      order: order !== undefined ? order : nextOrder,
    });

    const savedChoice = await choiceRepository.save(newChoice);

    res.status(201).json({
      message: "Choice created successfully",
      choice: savedChoice,
    });
  } catch (error) {
    console.error("Create choice error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a choice
export const updateChoice = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { text, targetNodeId, order } = req.body;

    const choiceRepository = AppDataSource.getRepository(Choice);

    const choice = await choiceRepository.findOne({
      where: { id },
      relations: ["sourceNode"],
    });

    if (!choice) {
      res.status(404).json({ message: "Choice not found" });
      return;
    }

    // Check if user is the author of the story
    const nodeRepository = AppDataSource.getRepository(Node);
    const sourceNode = await nodeRepository.findOne({
      where: { id: choice.sourceNodeId },
      relations: ["story"],
    });

    if (!sourceNode) {
      res.status(404).json({ message: "Source node not found" });
      return;
    }

    const storyRepository = AppDataSource.getRepository(Story);
    const story = await storyRepository.findOne({
      where: { id: sourceNode.storyId },
    });

    if (!story) {
      res.status(404).json({ message: "Story not found" });
      return;
    }

    if (story.authorId !== req.user.id) {
      res.status(403).json({
        message: "You can only update choices in your own stories",
      });
      return;
    }

    // If target node is changing, verify it exists and belongs to the same story
    if (targetNodeId && targetNodeId !== choice.targetNodeId) {
      const targetNode = await nodeRepository.findOne({
        where: { id: targetNodeId },
      });

      if (!targetNode) {
        res.status(404).json({ message: "Target node not found" });
        return;
      }

      if (targetNode.storyId !== sourceNode.storyId) {
        res.status(400).json({
          message: "Target node must belong to the same story",
        });
        return;
      }

      choice.targetNodeId = targetNodeId;
    }

    // Update choice fields
    if (text !== undefined) choice.text = text;
    if (order !== undefined) choice.order = order;

    const updatedChoice = await choiceRepository.save(choice);

    res.status(200).json({
      message: "Choice updated successfully",
      choice: updatedChoice,
    });
  } catch (error) {
    console.error("Update choice error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a choice
export const deleteChoice = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    const choiceRepository = AppDataSource.getRepository(Choice);

    const choice = await choiceRepository.findOne({
      where: { id },
      relations: ["sourceNode"],
    });

    if (!choice) {
      res.status(404).json({ message: "Choice not found" });
      return;
    }

    // Check if user is the author of the story
    const nodeRepository = AppDataSource.getRepository(Node);
    const sourceNode = await nodeRepository.findOne({
      where: { id: choice.sourceNodeId },
      relations: ["story"],
    });

    if (!sourceNode) {
      res.status(404).json({ message: "Source node not found" });
      return;
    }

    const storyRepository = AppDataSource.getRepository(Story);
    const story = await storyRepository.findOne({
      where: { id: sourceNode.storyId },
    });

    if (!story) {
      res.status(404).json({ message: "Story not found" });
      return;
    }

    if (story.authorId !== req.user.id) {
      res.status(403).json({
        message: "You can only delete choices in your own stories",
      });
      return;
    }

    await choiceRepository.remove(choice);

    res.status(200).json({
      message: "Choice deleted successfully",
    });
  } catch (error) {
    console.error("Delete choice error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reorder choices for a node
export const reorderChoices = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { nodeId } = req.params;
    const { choiceIds } = req.body;

    if (!Array.isArray(choiceIds)) {
      res.status(400).json({ message: "choiceIds must be an array" });
      return;
    }

    // Check if the node exists and user is the author
    const nodeRepository = AppDataSource.getRepository(Node);
    const node = await nodeRepository.findOne({
      where: { id: nodeId },
      relations: ["story"],
    });

    if (!node) {
      res.status(404).json({ message: "Node not found" });
      return;
    }

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
        message: "You can only reorder choices in your own stories",
      });
      return;
    }

    // Get current choices for this node
    const choiceRepository = AppDataSource.getRepository(Choice);
    const choices = await choiceRepository.find({
      where: { sourceNodeId: nodeId },
    });

    // Validate all choice IDs belong to this node
    const nodeChoiceIds = choices.map((choice) => choice.id);
    const validChoiceIds = choiceIds.filter((id) => nodeChoiceIds.includes(id));

    if (validChoiceIds.length !== choiceIds.length) {
      res.status(400).json({
        message: "All choice IDs must belong to the specified node",
      });
      return;
    }

    // Update order of each choice
    const updatePromises = validChoiceIds.map((id, index) => {
      return choiceRepository.update(id, { order: index });
    });

    await Promise.all(updatePromises);

    // Get updated choices
    const updatedChoices = await choiceRepository.find({
      where: { sourceNodeId: nodeId },
      order: { order: "ASC" },
    });

    res.status(200).json({
      message: "Choices reordered successfully",
      choices: updatedChoices,
    });
  } catch (error) {
    console.error("Reorder choices error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
