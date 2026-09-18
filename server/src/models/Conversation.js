import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      maxlength: 100,
    },
    tone: {
      type: String,
      enum: ['Professional', 'Casual', 'Concise'],
      default: 'Professional',
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

// Auto-generate title from first user message
conversationSchema.methods.generateTitle = function () {
  const firstUserMsg = this.messages.find((m) => m.role === 'user');
  if (firstUserMsg) {
    this.title = firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '');
  }
};

export default mongoose.model('Conversation', conversationSchema);
