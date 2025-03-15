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
import { User } from "./user.model";
import { Node } from "./node.model";

@Entity("stories")
export class Story {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ default: true })
  isDraft: boolean;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ nullable: true })
  coverImage: string;

  @ManyToOne(() => User, (user) => user.stories)
  @JoinColumn({ name: "authorId" })
  author: User;

  @Column()
  authorId: string;

  @Column({ nullable: true })
  firstNodeId: string;

  @OneToMany(() => Node, (node) => node.story)
  nodes: Node[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
