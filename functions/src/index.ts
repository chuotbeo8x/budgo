import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';

// Set global options
setGlobalOptions({
  region: 'asia-southeast1',
  maxInstances: 10,
});

// Simple API handler
export const api = onRequest(
  { region: 'asia-southeast1', maxInstances: 10 },
  async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    try {
      const { method, url } = req;
      console.log(`${method} ${url}`);

      // Route API requests
      if (url?.startsWith('/api/admin/broadcast')) {
        if (method === 'POST') {
          // Handle broadcast notification
          const { title, message } = req.body;
          
          if (!title || !message) {
            res.status(400).json({ 
              success: false, 
              message: 'Tiêu đề và nội dung không được để trống' 
            });
            return;
          }

          // Here you would implement the actual broadcast logic
          // For now, just return success
          res.json({
            success: true,
            message: `Đã gửi thông báo: "${title}"`,
            recipientCount: 1 // Mock count
          });
        } else if (method === 'GET') {
          // Handle broadcast history
          res.json({
            success: true,
            data: [
              {
                id: '1',
                title: 'Chào mừng đến với Budgo!',
                message: 'Đây là thông báo chào mừng đầu tiên.',
                sentAt: new Date().toISOString(),
                sentBy: 'admin',
                recipientCount: 1
              }
            ]
          });
        }
      } else if (url?.startsWith('/api/admin/stats')) {
        // Handle admin stats
        res.json({
          success: true,
          data: {
            totalUsers: 1,
            totalGroups: 0,
            totalTrips: 0,
            totalExpenses: 0
          }
        });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'API endpoint not found' 
        });
      }
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
);