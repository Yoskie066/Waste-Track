import AdminReportWasteModel from '../../models/AdminModels/AdminReportWasteModel.js';
import XLSX from 'xlsx';

class AdminReportWasteController {
  static async getAllReports(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const wasteName = req.query.wasteName || '';
      const category = req.query.category || '';
      const subCategory = req.query.subCategory || '';
      const color = req.query.color || '';
      const location = req.query.location || '';
      const month = req.query.month || '';
      const year = req.query.year || '';
      const sortBy = req.query.sortBy || 'datereported';
      const sortOrder = req.query.sortOrder || 'DESC';

      const result = await AdminReportWasteModel.getAllReports({
        page, limit, search, wasteName, category, subCategory,
        color, location, dateFrom: '', dateTo: '', month, year, sortBy, sortOrder
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
      console.error('Error in getAllReports Controller:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch reported waste', error: error.message });
    }
  }

  static async deleteReport(req, res) {
    try {
      const { id } = req.params;
      const deleted = await AdminReportWasteModel.deleteReport(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }
      res.json({ success: true, message: 'Report deleted successfully', data: deleted });
    } catch (error) {
      console.error('Error in deleteReport Controller:', error);
      res.status(500).json({ success: false, message: 'Failed to delete report', error: error.message });
    }
  }

  static async exportReports(req, res) {
    try {
      const { search, wasteName, category, subCategory, color, location, month, year, sortBy, sortOrder } = req.query;
      const result = await AdminReportWasteModel.getAllReports({
        page: 1, limit: 100000, search, wasteName, category, subCategory,
        color, location, dateFrom: '', dateTo: '', month, year, sortBy, sortOrder
      });

      const data = result.data.map(item => ({
        'Waste Name': item.wastename,
        'Category': item.category,
        'Sub Category': item.subcategory,
        'Color': item.color,
        'Location': item.location,
        'Date Reported': new Date(item.datereported).toLocaleDateString(),
        'Description': item.description,
        'Photo URL': item.photourl,
        'User Email': item.useremail
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reported Waste');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', 'attachment; filename="reported_waste.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Error in exportReports Controller:', error);
      res.status(500).json({ success: false, message: 'Failed to export data', error: error.message });
    }
  }

  static async getColors(req, res) {
    try {
      const colors = await AdminReportWasteModel.getDistinctColors();
      res.json({ success: true, data: colors });
    } catch (error) {
      console.error('Error in getColors:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch colors', error: error.message });
    }
  }

  static async getLocations(req, res) {
    try {
      const locations = await AdminReportWasteModel.getDistinctLocations();
      res.json({ success: true, data: locations });
    } catch (error) {
      console.error('Error in getLocations:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch locations', error: error.message });
    }
  }

  static async getYears(req, res) {
    try {
      const years = await AdminReportWasteModel.getDistinctYears();
      res.json({ success: true, data: years });
    } catch (error) {
      console.error('Error in getYears:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch years', error: error.message });
    }
  }
}

export default AdminReportWasteController;