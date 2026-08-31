const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    name: { type: String, required: true },
    type: { type: String, required: true }, // pdf, png, jpg, docx, xlsx, zip, folder
    size: { type: Number, default: 0 }, // bytes
    path: { type: String, required: true }, // local storage path or URL
    sharedWithClient: { type: Boolean, default: false },
    downloads: { type: Number, default: 0 },
    isFolder: { type: Boolean, default: false },
    parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', fileSchema);
