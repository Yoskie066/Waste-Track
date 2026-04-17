import ReportWasteModel from '../../models/UserModels/ReportWasteModel.js';
import cloudinary from '../../config/cloudinary.js';

class ReportWasteController {
  static async addReport(req, res) {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(401).json({ success: false, message: "User email not found in token" });
      }

      const reportData = { ...req.body, userEmail };

      // Image is required for new report
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Image is required" });
      }

      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const uploadResult = await cloudinary.uploader.upload(dataURI, { folder: 'eco_track_uploads' });
      reportData.photoUrl = uploadResult.secure_url;

      const result = await ReportWasteModel.addReport(reportData);
      res.status(201).json({
        success: true,
        message: 'Waste reported successfully',
        id: result.id
      });
    } catch (error) {
      console.error("Error adding report:", error);
      res.status(500).json({ success: false, message: "Failed to report waste", error: error.message });
    }
  }

  static async updateReport(req, res) {
    try {
      const { id } = req.params;
      const reportData = { ...req.body };

      // Image is optional for update
      if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const uploadResult = await cloudinary.uploader.upload(dataURI, { folder: 'eco_track_uploads' });
        reportData.photoUrl = uploadResult.secure_url;
      } else {
        // If no new image, keep the existing one – remove from body so it's not overwritten
        delete reportData.photoUrl;
      }

      const updated = await ReportWasteModel.updateReport(id, reportData);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Report not found" });
      }

      res.json({ success: true, message: "Report updated successfully", data: updated });
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).json({ success: false, message: "Failed to update report", error: error.message });
    }
  }

  static async deleteReport(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ReportWasteModel.deleteReport(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Report not found" });
      }
      res.json({ success: true, message: "Report deleted successfully", data: deleted });
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({ success: false, message: "Failed to delete report", error: error.message });
    }
  }

  static async getUserReports(req, res) {
    try {
      const email = req.user.email;
      const reports = await ReportWasteModel.getUserReports(email);
      res.json({ success: true, data: reports });
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch reports', error: error.message });
    }
  }

  static async getReportById(req, res) {
    try {
      const { id } = req.params;
      const report = await ReportWasteModel.getReportById(id);
      if (!report) {
        return res.status(404).json({ success: false, message: "Report not found" });
      }
      res.json({ success: true, data: report });
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch report', error: error.message });
    }
  }
}

export default ReportWasteController;