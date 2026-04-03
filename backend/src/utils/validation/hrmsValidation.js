const Joi = require('joi');

// Attendance Validation
const createAttendanceSchema = Joi.object({
  employee_id: Joi.string().uuid().required(),
  date: Joi.date().required(),
  check_in: Joi.string().optional(),
  check_out: Joi.string().optional(),
  status: Joi.string().valid('present', 'absent', 'half_day', 'late', 'on_leave').default('present'),
  notes: Joi.string().optional().allow(''),
  location_lat: Joi.number().optional(),
  location_lng: Joi.number().optional(),
  ip_address: Joi.string().optional().allow(''),
  device_info: Joi.string().optional().allow(''),
});

const updateAttendanceSchema = Joi.object({
  check_in: Joi.string().optional(),
  check_out: Joi.string().optional(),
  status: Joi.string().valid('present', 'absent', 'half_day', 'late', 'on_leave').optional(),
  notes: Joi.string().optional().allow(''),
  break_start: Joi.string().optional(),
  break_end: Joi.string().optional(),
  break_duration: Joi.number().optional(),
  total_hours: Joi.number().optional(),
});

// Leave Request Validation
const createLeaveRequestSchema = Joi.object({
  employee_id: Joi.string().uuid().required(),
  leave_type_id: Joi.string().uuid().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  reason: Joi.string().required(),
  status: Joi.string().valid('pending', 'approved', 'rejected').default('pending'),
  notes: Joi.string().optional().allow(''),
});

const updateLeaveRequestSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
  notes: Joi.string().optional().allow(''),
  reviewed_by: Joi.string().uuid().optional(),
  reviewed_at: Joi.date().optional(),
});

module.exports = {
  createAttendanceSchema,
  updateAttendanceSchema,
  createLeaveRequestSchema,
  updateLeaveRequestSchema,
};
