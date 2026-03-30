import LoginPageContent from '../models/LoginPageContent.js';

// GET - public, used by login page
export const getLoginPageContent = async (req, res) => {
  try {
    let content = await LoginPageContent.findOne();
    if (!content) {
      content = await LoginPageContent.create({
        lines: [],
        bgColor: '#4c1d95',
        showImage: false,
        imagePosition: 'bottom',
      });
    }
    res.json({ success: true, data: content });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT - admin only
export const updateLoginPageContent = async (req, res) => {
  try {
    const content = await LoginPageContent.findOneAndUpdate(
      {},
      { ...req.body, updatedAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: content });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
