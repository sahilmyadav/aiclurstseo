import Plan from '../models/Plan.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all plans
// @route   GET /api/admin/plans
// @access  Private/Admin
const getPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({});
  console.log("Plans>>>>>>>>>",plans)
  res.json(plans);
});

// @desc    Update a plan
// @route   PUT /api/admin/plans/:id
// @access  Private/Admin
const updatePlan = asyncHandler(async (req, res) => {
  const { 
    name, 
    description, 
    pricePerProfile, 
    discountPercent, 
    isPopular, 
    features, 
    buttonText, 
    badgeText, 
    isActive 
  } = req.body;
  
  const plan = await Plan.findById(req.params.id);
  
  if (plan) {
    plan.name = name || plan.name;
    plan.description = description || plan.description;
    plan.pricePerProfile = pricePerProfile || plan.pricePerProfile;
    plan.discountPercent = discountPercent !== undefined ? discountPercent : plan.discountPercent;
    plan.isPopular = isPopular !== undefined ? isPopular : plan.isPopular;
    plan.features = features || plan.features;
    plan.buttonText = buttonText || plan.buttonText;
    plan.badgeText = badgeText || plan.badgeText;
    plan.isActive = isActive !== undefined ? isActive : plan.isActive;
    
    const updatedPlan = await plan.save();
    res.json(updatedPlan);
  } else {
    res.status(404);
    throw new Error('Plan not found');
  }
});

// @desc    Toggle plan status
// @route   PATCH /api/admin/plans/:id/status
// @access  Private/Admin
const togglePlanStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const plan = await Plan.findById(req.params.id);
  
  if (plan) {
    plan.isActive = isActive;
    const updatedPlan = await plan.save();
    res.json(updatedPlan);
  } else {
    res.status(404);
    throw new Error('Plan not found');
  }
});

export {
  getPlans,
  updatePlan,
  togglePlanStatus
};