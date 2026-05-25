import UserManagementModel from '../../models/AdminModels/UserManagementModel.js';
import XLSX from 'xlsx';

class UserManagementController {
  static async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const role = req.query.role || 'all';
      const status = req.query.status || 'all';
      const month = req.query.month || 'all';
      const year = req.query.year || 'all';
      const sortBy = req.query.sortBy || 'created_at';
      const sortOrder = req.query.sortOrder || 'DESC';

      const result = await UserManagementModel.getAllUsersAndAdmins({
        page, limit, search, role, status, month, year, sortBy, sortOrder
      });

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page, limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      console.error('Error in getAllUsers Controller:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!role || (role !== 'user' && role !== 'admin')) {
        return res.status(400).json({ success: false, message: 'Valid role (user/admin) is required' });
      }
      const deleted = await UserManagementModel.deleteUserOrAdmin(id, role);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'User/Admin not found' });
      }
      res.json({ success: true, message: `${role === 'user' ? 'User' : 'Admin'} deleted successfully`, data: deleted });
    } catch (error) {
      console.error('Error in deleteUser Controller:', error);
      res.status(500).json({ success: false, message: 'Failed to delete user/admin', error: error.message });
    }
  }

  static async exportUsers(req, res) {
    try {
      const { search, role, status, month, year, sortBy, sortOrder } = req.query;
      const result = await UserManagementModel.getAllUsersAndAdmins({
        page: 1, limit: 100000, search, role, status, month, year, sortBy, sortOrder
      });

      const data = result.data.map(item => ({
        'Email': item.email,
        'Role': item.role === 'user' ? 'User' : 'Admin',
        'Status': item.status === 'online' ? 'Online' : 'Offline',
        'Created At': new Date(item.created_at).toLocaleString(),
        'Last Updated': new Date(item.updated_at).toLocaleString(),
        'Avatar URL': item.avatar_url || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users & Admins');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', 'attachment; filename="user_management.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Error in exportUsers Controller:', error);
      res.status(500).json({ success: false, message: 'Failed to export data', error: error.message });
    }
  }

  static async getYears(req, res) {
    try {
      const years = await UserManagementModel.getDistinctYears();
      res.json({ success: true, data: years });
    } catch (error) {
      console.error('Error in getYears:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch years', error: error.message });
    }
  }
}

export default UserManagementController;