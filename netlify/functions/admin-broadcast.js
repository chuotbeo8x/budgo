exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod === 'POST') {
      // Handle broadcast notification
      const { title, message } = JSON.parse(event.body);
      
      if (!title || !message) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Tiêu đề và nội dung không được để trống'
          }),
        };
      }

      // Here you would implement the actual broadcast logic
      // For now, just return success
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: `Đã gửi thông báo: "${title}"`,
          recipientCount: 1 // Mock count
        }),
      };
    } else if (event.httpMethod === 'GET') {
      // Handle broadcast history
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: '1',
              title: 'Chào mừng đến với QA Tracker!',
              message: 'Đây là thông báo chào mừng đầu tiên.',
              sentAt: new Date().toISOString(),
              sentBy: 'admin',
              recipientCount: 1
            },
            {
              id: '2',
              title: 'Cập nhật hệ thống',
              message: 'Hệ thống đã được cập nhật với nhiều tính năng mới.',
              sentAt: new Date(Date.now() - 86400000).toISOString(),
              sentBy: 'admin',
              recipientCount: 5
            }
          ]
        }),
      };
    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Method not allowed'
        }),
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error'
      }),
    };
  }
};
