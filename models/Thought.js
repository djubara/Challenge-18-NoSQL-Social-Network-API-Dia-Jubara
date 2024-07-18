const { Schema, model, get } = require('mongoose');
// Schema to create a course model
const reactionSchema = new Schema(
    {
        body: {
            type: String,
            required: true,
            minLength: 1,
            maxLength: 280,
        },
        username:
        {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            get: (createdAtVal) => new Date(createdAtVal).toLocalString(),
        },
    },
    {

    }
);
// Schema to create a course model
const thoughtSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
            minLength: 1,
            maxLength: 280,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            get: (createdAtVal) => new Date(createdAtVal).toLocalString(),
        },
        username:
        {
            type: String,
            required: true,
        },
        reactions: [
            reactionSchema,
        ],
    },
    {
        toJSON: {
            virtuals: true,
        },
        id: false,
    }
);
thoughtSchema.virtual("reactionCount").get(function () {
    return this.reactions.length
})

const Thought = model('Thought', thoughtSchema);

module.exports = Thought;
