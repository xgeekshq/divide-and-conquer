import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes } from 'mongoose';
import { mongooseLeanVirtuals } from 'mongoose-lean-virtuals';
import BaseModel from 'src/libs/models/base.model';
import User from 'src/modules/users/entities/user.schema';
import Comment, { CommentSchema } from '../../comments/entities/comment.schema';

export type CardItemDocument = CardItem & Document;

@Schema()
export default class CardItem extends BaseModel {
	@Prop({ nullable: false })
	text!: string;

	@Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'User' }] })
	votes!: User[] | ObjectId[] | string[];

	@Prop({ type: [CommentSchema] })
	comments!: Comment[];

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User', nullable: false })
	createdBy!: User | ObjectId | string;

	@Prop()
	createdByTeam!: string;

	@Prop({ nullable: false, default: false })
	anonymous!: boolean;

	@Prop({ type: Date, default: Date.now })
	createdAt: Date;
}

export const CardItemSchema = SchemaFactory.createForClass(CardItem);

CardItemSchema.plugin(mongooseLeanVirtuals);
