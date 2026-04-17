import CollectWasteModel from '../../models/UserModels/CollectWasteModel.js';
import cloudinary from '../../config/cloudinary.js';

class CollectWasteController {
  static async addCollectWaste(req, res) {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(401).json({ success: false, message: "User email not found in token" });
      }

      const data = { ...req.body, userEmail };

      if (!req.file) {
        return res.status(400).json({ success: false, message: "Image is required" });
      }

      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const uploadResult = await cloudinary.uploader.upload(dataURI, { folder: 'eco_track_uploads' });
      data.photoUrl = uploadResult.secure_url;

      const result = await CollectWasteModel.addCollectWaste(data);
      res.status(201).json({
        success: true,
        message: 'Waste collected successfully',
        id: result.id
      });
    } catch (error) {
      console.error("Error adding collect waste:", error);
      res.status(500).json({ success: false, message: "Failed to record collection", error: error.message });
    }
  }

  static async updateCollectWaste(req, res) {
    try {
      const { id } = req.params;
      const data = { ...req.body };

      if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const uploadResult = await cloudinary.uploader.upload(dataURI, { folder: 'eco_track_uploads' });
        data.photoUrl = uploadResult.secure_url;
      } else {
        delete data.photoUrl;
      }

      const updated = await CollectWasteModel.updateCollectWaste(id, data);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Collection record not found" });
      }
      res.json({ success: true, message: "Collection updated successfully", data: updated });
    } catch (error) {
      console.error("Error updating collect waste:", error);
      res.status(500).json({ success: false, message: "Failed to update collection", error: error.message });
    }
  }

  static async deleteCollectWaste(req, res) {
    try {
      const { id } = req.params;
      const deleted = await CollectWasteModel.deleteCollectWaste(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Collection record not found" });
      }
      res.json({ success: true, message: "Collection deleted successfully", data: deleted });
    } catch (error) {
      console.error("Error deleting collect waste:", error);
      res.status(500).json({ success: false, message: "Failed to delete collection", error: error.message });
    }
  }

  static async getUserCollectWastes(req, res) {
    try {
      const email = req.user.email;
      const records = await CollectWasteModel.getUserCollectWastes(email);
      res.json({ success: true, data: records });
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ success: false, message: "Failed to fetch collections", error: error.message });
    }
  }

  static async getCollectWasteById(req, res) {
    try {
      const { id } = req.params;
      const record = await CollectWasteModel.getCollectWasteById(id);
      if (!record) {
        return res.status(404).json({ success: false, message: "Collection record not found" });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ success: false, message: "Failed to fetch collection", error: error.message });
    }
  }
}

export default CollectWasteController;