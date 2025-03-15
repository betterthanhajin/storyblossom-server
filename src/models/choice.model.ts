import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Node } from "./node.model";

@Entity("choices")
export class Choice {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  text: string;

  @ManyToOne(() => Node, (node) => node.choices)
  @JoinColumn({ name: "sourceNodeId" })
  sourceNode: Node;

  @Column()
  sourceNodeId: string;

  @ManyToOne(() => Node)
  @JoinColumn({ name: "targetNodeId" })
  targetNode: Node;

  @Column()
  targetNodeId: string;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
