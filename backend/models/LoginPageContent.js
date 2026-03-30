import mongoose from 'mongoose';

const LineSchema = new mongoose.Schema({
  text: { type: String, default: '' },
  color: { type: String, default: '#ffffff' },
  fontSize: { type: String, default: '2xl' },
  fontWeight: { type: String, default: 'bold' },
  marginTop: { type: Number, default: 0 },
  marginLeft: { type: Number, default: 0 },
  paddingLeft: { type: Number, default: 0 },
  animation: { type: String, default: 'none' },
  fontFamily: { type: String, default: 'default' },
}, { _id: false });

const LoginPageContentSchema = new mongoose.Schema({
  lines: { type: [LineSchema], default: [] },
  bgColor: { type: String, default: '#7c3aed' },
  imageUrl: { type: String, default: '' },
  imagePosition: { type: String, enum: ['top', 'bottom', 'center', 'background'], default: 'bottom' },
  showImage: { type: Boolean, default: false },
  imageWidth: { type: Number, default: 100 },   // percent
  imageHeight: { type: Number, default: 200 },  // px
  imageMarginTop: { type: Number, default: 0 },
  imageMarginLeft: { type: Number, default: 0 },
  imagePaddingLeft: { type: Number, default: 0 },
  panelPaddingX: { type: Number, default: 48 }, // px
  panelPaddingY: { type: Number, default: 48 },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('LoginPageContent', LoginPageContentSchema);
