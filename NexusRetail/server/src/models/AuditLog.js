const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin user reference is required'],
    },
    action: {
      type: String,
      enum: {
        values: [
          'CREATE',
          'UPDATE',
          'DELETE',
          'RESTORE',
          'ACTIVATE',
          'DEACTIVATE',
          'APPROVE',
          'REJECT',
          'EXPORT',
          'IMPORT',
          'BULK_ACTION',
          'LOGIN',
          'LOGOUT',
          'PERMISSION_CHANGE',
          'ROLE_CHANGE',
          'CONFIG_CHANGE',
          'OTHER',
        ],
        message: 'Please select a valid action type',
      },
      required: true,
    },
    entityType: {
      type: String,
      enum: {
        values: [
          'User',
          'Product',
          'Order',
          'Category',
          'Coupon',
          'Admin',
          'System',
          'Other',
        ],
        message: 'Please select a valid entity type',
      },
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    entityName: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'warning'],
      default: 'success',
    },
    errorMessage: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    severity: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: 'Please select a valid severity level',
      },
      default: 'low',
    },
    affectedRecords: {
      type: Number,
      default: 1,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

// Indexes for performance and querying
auditLogSchema.index({ adminUser: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ entityId: 1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ createdAt: -1 }); // For latest logs
auditLogSchema.index({ adminUser: 1, createdAt: -1 }); // For user activity timeline
auditLogSchema.index({ entityType: 1, action: 1, createdAt: -1 }); // For entity-specific audit trails

// Compound index for complex queries
auditLogSchema.index({
  adminUser: 1,
  action: 1,
  createdAt: -1,
});

// TTL index to auto-delete logs after 90 days (adjustable)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function () {
  return this.createdAt.toLocaleString();
});

// Method to get action summary
auditLogSchema.statics.getActionSummary = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

// Method to get user activity
auditLogSchema.statics.getUserActivity = function (userId, limit = 50) {
  return this.find({ adminUser: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('adminUser', 'firstName lastName email');
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
