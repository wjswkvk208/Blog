import Post from '../../models/post.js';
import mongoose from 'mongoose';
import Joi from 'joi';

const  {ObjectId} = mongoose.Types;

export const checkObjectId = (ctx, next) => {
    const {id} = ctx.params;
    if(!ObjectId.isValid(id)){
        ctx.status=400;
        return;
    }
    return next();
}

export const write = async ctx => {
    const schema = Joi.object().keys({
        title:Joi.string().required(),
        body:Joi.string().required(),
        tags:Joi.array().items(Joi.string()).required(),
    });

    const result = schema.validate(ctx.request.body);
    if(result.error){
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const {title,body,tags} = ctx.request.body;
    const post = new Post({
        title,body,tags,
    });

    try {
        await post.save();
        ctx.body = post;
    } catch (error) {
        ctx.throw(500,error);
    }
};

export const list = async ctx =>{
    const contentCountPerPage = 10;
    const page = parseInt(ctx.query.page || '1' ,10);
    if(page < 1){
        ctx.status = 400;
        return;
    }
    try {
        const posts = await Post.find()
        .sort({_id:-1})
        .limit(contentCountPerPage)
        .skip((page -1) * contentCountPerPage)
        .exec();

        const postCount = await Post.countDocuments().exec();
        ctx.set('Last-Page', Math.ceil(postCount/contentCountPerPage));
        if(!posts){
            ctx.status = 404;
            return;
        }
        ctx.body = posts;
    } catch (error) {
        ctx.throw(500, error);
    }
};

export const read = async ctx => {
    const {id} = ctx.params;
    try {
        const post = await Post.findById(id).exec();
        if(!post){
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch (error) {
        ctx.throw(500, error);
    }
}

export const remove = async ctx =>{    
    const {id} = ctx.params;
    try {
        const post = await Post.findByIdAndRemove(id).exec();
        ctx.status = 204;
        ctx.body = post;
    } catch (error) {
        ctx.throw(500, error);
    }
};

export const update = async ctx =>{
    const {id} = ctx.params;
    try {
        const post = await Post.findByIdAndUpdate(id, ctx.request.body,{
            new:true,
        }).exec();
        if(!post){
            ctx.status = 404;
            ctx.body = post;
        }
        ctx.body = post;
    } catch (error) {
        ctx.throw(500, error);        
    }
}