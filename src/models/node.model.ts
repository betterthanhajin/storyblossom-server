import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Story } from "./story.model";
import { Choice } from "./choice.model";

@Entity("nodes")
export class Node {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  content: string;

  @Column({ nullable: true })
  title: string;

  @ManyToOne(() => Story, (story) => story.nodes)
  @JoinColumn({ name: "storyId" })
  story: Story;

  @Column()
  storyId: string;

  @Column({ default: false })
  isEnding: boolean;

  @OneToMany(() => Choice, (choice) => choice.sourceNode)
  choices: Choice[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
