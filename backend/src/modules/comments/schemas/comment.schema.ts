import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import User from 'src/modules/users/schemas/user.schema';

export type CommentDocument = Comment & mongoose.Document;

@Schema()
export default class Comment {
	@Prop({ nullable: false })
	text!: string;

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
	createdBy!: User | mongoose.Schema.Types.ObjectId;

	@Prop({ nullable: false })
	anonymous!: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
