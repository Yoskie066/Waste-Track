import AdminCollectWasteModel from '../../models/AdminModels/AdminCollectWasteModel.js';
import XLSX from 'xlsx';

class AdminCollectWasteController {
  static async getAllCollectWastes(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const wasteName = req.query.wasteName || '';
      const category = req.query.category || '';
      const subCategory = req.query.subCategory || '';
      const unit = req.query.unit || '';
      const dateFrom = req.query.dateFrom || '';
      const dateTo = req.query.dateTo || '';
      const month = req.query.month || '';
      const year = req.query.year || '';
      const sortBy = req.query.sortBy || 'datecollected';
      const sortOrder = req.query.sortOrder || 'DESC';

      const result = await AdminCollectWasteModel.getAllCollectWastes({
        page, limit, search, wasteName, category, subCategory,
        unit, dateFrom, dateTo, month, year, sortBy, sortOrder
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
      console.error('Error in getAllCollectWastes Controller:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch collected waste', error: error.message });
    }
  }

  static async deleteCollectWaste(req, res) {
    try {
      const { id } = req.params;
      const deleted = await AdminCollectWasteModel.deleteCollectWaste(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Collection record not found' });
      }
      res.json({ success: true, message: 'Collection record deleted successfully', data: deleted });
    } catch (error) {
      console.error('Error in deleteCollectWaste Controller:', error);
      res.status(500).json({ success: false, message: 'Failed to delete collection', error: error.message });
    }
  }

  static async exportCollectWastes(req, res) {
    try {
      const { search, wasteName, category, subCategory, unit, dateFrom, dateTo, month, year, sortBy, sortOrder } = req.query;
      const result = await AdminCollectWasteModel.getAllCollectWastes({
        page: 1, limit: 100000, search, wasteName, category, subCategory,
        unit, dateFrom, dateTo, month, year, sortBy, sortOrder
      });

      const data = result.data.map(item => ({
        'Waste Name': item.wastename,
        'Category': item.category,
        'Sub Category': item.subcategory,
        'Quantity': item.quantity,
        'Unit': item.unit,
        'Date Collected': new Date(item.datecollected).toLocaleDateString(),
        'Description': item.description,
        'Photo URL': item.photourl,
        'User Email': item.useremail
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Collected Waste');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', 'attachment; filename="collected_waste.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Error in exportCollectWastes Controller:', error);
      res.status(500).json({ success: false, message: 'Failed to export data', error: error.message });
    }
  }

  static async getUnits(req, res) {
    try {
      const units = await AdminCollectWasteModel.getDistinctUnits();
      res.json({ success: true, data: units });
    } catch (error) {
      console.error('Error in getUnits:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch units', error: error.message });
    }
  }

  static async getYears(req, res) {
    try {
      const years = await AdminCollectWasteModel.getDistinctYears();
      res.json({ success: true, data: years });
    } catch (error) {
      console.error('Error in getYears:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch years', error: error.message });
    }
  }
}

export default AdminCollectWasteController;